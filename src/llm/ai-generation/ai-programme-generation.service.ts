import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import type { ProgrammeValidationFinding } from '../../validation/validation.types.js';
import type { AiProgrammeGenerationProvider } from './ai-programme-generation-provider.js';
import type { AiPhaseOutput, AiStrategyOutput, PhaseSummary } from './ai-generation.types.js';
import {
  buildAiStrategyContext,
  buildAiPhaseContext,
  summarisePhase,
} from './ai-generation-context-builder.js';
import { assembleProgramme } from './ai-programme-assembler.js';
import { validatePhaseInIsolation } from './validate-phase-in-isolation.js';
import { createToolExecutor } from './agent-tool-executor.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../../validation/longitudinal-validation-registry.js';

const MAX_STRATEGY_RETRIES = 3;
const MAX_PHASE_RETRIES = 3;
const MAX_REPLANS = 1;

export type AiGenerationInput = {
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  provider: AiProgrammeGenerationProvider;
  requestId: string;
  startDate: string;
  exerciseLibraryVersion: string;
  deadline?: number;
  now?: (() => number) | undefined;
  logger?: { debug: (...args: unknown[]) => void } | undefined;
};

export type AiGenerationResult = {
  programme: LongitudinalOdinProgramme;
  strategy: AiStrategyOutput;
  phases: AiPhaseOutput[];
  stage_durations_ms: Record<string, number>;
  total_input_tokens: number;
  total_output_tokens: number;
};

export class AiGenerationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly stage: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AiGenerationError';
  }
}

const checkDeadline = (deadline: number | undefined, now: () => number, stage: string) => {
  if (deadline !== undefined && now() > deadline) {
    throw new AiGenerationError(
      'AI_GENERATION_TIMEOUT',
      `AI generation timed out during ${stage}.`,
      stage,
    );
  }
};

export const generateAiProgramme = async (
  input: AiGenerationInput,
): Promise<AiGenerationResult> => {
  const now = input.now ?? Date.now;
  const log = input.logger ?? { debug: () => {} };
  const durations: Record<string, number> = {};
  let totalInput = 0;
  let totalOutput = 0;

  const toolExecutor = createToolExecutor(input.exercises, input.profile);

  // Stage 1: Generate strategy
  checkDeadline(input.deadline, now, 'strategy');
  const strategyStart = now();
  let strategy: AiStrategyOutput | null = null;

  for (let attempt = 0; attempt < MAX_STRATEGY_RETRIES; attempt++) {
    checkDeadline(input.deadline, now, 'strategy');
    const context = buildAiStrategyContext(input.profile, input.exercises);

    log.debug('ai_generation_strategy_attempt', { attempt, requestId: input.requestId });

    const result = await input.provider.generateStrategy(context, {
      requestId: input.requestId,
    });

    totalInput += result.usage.inputTokens ?? 0;
    totalOutput += result.usage.outputTokens ?? 0;

    strategy = result.output;
    break;
  }

  if (!strategy) {
    throw new AiGenerationError(
      'AI_STRATEGY_GENERATION_FAILED',
      'Failed to generate programme strategy after retries.',
      'strategy',
    );
  }

  durations['strategy'] = now() - strategyStart;
  log.debug('ai_generation_strategy_complete', {
    requestId: input.requestId,
    phases: strategy.phase_skeletons.length,
    target_weeks: strategy.programme.target_weeks,
  });

  // Stage 2..N: Generate phases with replanning support
  let replanCount = 0;
  let validatedPhases: AiPhaseOutput[] = [];
  let priorSummaries: PhaseSummary[] = [];

  outer: for (let replan = 0; replan <= MAX_REPLANS; replan++) {
    if (replan > 0) {
      validatedPhases = [];
      priorSummaries = [];
    }

    const failedPhaseNumbers: number[] = [];

    for (const skeleton of strategy.phase_skeletons) {
      const phaseLabel = `phase_${skeleton.phase_number}`;
      checkDeadline(input.deadline, now, phaseLabel);
      const phaseStart = now();

      let generatedPhase: AiPhaseOutput | null = null;
      let lastFindings: ProgrammeValidationFinding[] = [];

      // Reasoning step
      const phaseCtx = buildAiPhaseContext(
        input.profile,
        strategy,
        skeleton,
        input.exercises,
        priorSummaries,
      );

      let reasoningOutput: string | undefined;
      if (input.provider.generateReasoning) {
        checkDeadline(input.deadline, now, `${phaseLabel}_reasoning`);
        log.debug('ai_generation_reasoning_start', {
          phase: skeleton.phase_number,
          requestId: input.requestId,
        });

        const reasoningResult = await input.provider.generateReasoning(phaseCtx, {
          requestId: input.requestId,
          toolExecutor,
        });
        reasoningOutput = reasoningResult.reasoning;
        totalInput += reasoningResult.usage.inputTokens ?? 0;
        totalOutput += reasoningResult.usage.outputTokens ?? 0;

        log.debug('ai_generation_reasoning_complete', {
          phase: skeleton.phase_number,
          reasoning_length: reasoningOutput.length,
        });
      }

      for (let attempt = 0; attempt < MAX_PHASE_RETRIES; attempt++) {
        checkDeadline(input.deadline, now, phaseLabel);

        log.debug('ai_generation_phase_attempt', {
          phase: skeleton.phase_number,
          attempt,
          requestId: input.requestId,
        });

        const providerCtx: import('./ai-generation.types.js').AiGenerationProviderContext = {
          requestId: input.requestId,
          toolExecutor,
          ...(reasoningOutput !== undefined ? { reasoningOutput } : {}),
        };
        if (attempt > 0 && lastFindings.length > 0) {
          providerCtx.retryFeedback = {
            validationCodes: lastFindings.map((f) => f.code),
            messages: lastFindings.map((f) => f.message),
          };
        }

        const result = await input.provider.generatePhase(phaseCtx, providerCtx);

        totalInput += result.usage.inputTokens ?? 0;
        totalOutput += result.usage.outputTokens ?? 0;

        // Validate phase in isolation
        const tempProgramme = assembleProgramme({
          strategy,
          phases: [...validatedPhases, result.output],
          startDate: input.startDate,
          startWeightKg: input.profile.source.current_weight_kg,
          targetWeightKg: input.profile.source.target_weight_kg,
          exerciseLibraryVersion: input.exerciseLibraryVersion,
          validationRuleVersion: LONGITUDINAL_VALIDATION_RULE_VERSION,
        });

        const findings = validatePhaseInIsolation({
          programme: tempProgramme,
          profile: input.profile,
          exercises: input.exercises,
          phaseIndex: validatedPhases.length,
        });

        const errors = findings.filter((f) => f.severity === 'error');

        if (errors.length === 0) {
          generatedPhase = result.output;
          break;
        }

        log.debug('ai_generation_phase_validation_failed', {
          phase: skeleton.phase_number,
          attempt,
          errors: errors.length,
          codes: errors.map((f) => f.code),
        });

        lastFindings = errors;
      }

      if (!generatedPhase) {
        failedPhaseNumbers.push(skeleton.phase_number);

        if (replanCount < MAX_REPLANS) {
          log.debug('ai_generation_replanning', {
            replanCount,
            failedPhases: failedPhaseNumbers,
            requestId: input.requestId,
          });

          replanCount++;
          const replanStart = now();

          const replanCtx = {
            requestId: input.requestId,
            retryFeedback: {
              validationCodes: lastFindings.map((f) => f.code),
              messages: [
                `Phase ${skeleton.phase_number} failed validation after ${MAX_PHASE_RETRIES} retries.`,
                ...lastFindings.map((f) => f.message),
              ],
            },
          };

          const strategyResult = await input.provider.generateStrategy(
            buildAiStrategyContext(input.profile, input.exercises),
            replanCtx,
          );
          strategy = strategyResult.output;
          totalInput += strategyResult.usage.inputTokens ?? 0;
          totalOutput += strategyResult.usage.outputTokens ?? 0;
          durations['replan_strategy'] = now() - replanStart;

          continue outer;
        }

        throw new AiGenerationError(
          'AI_PHASE_GENERATION_FAILED',
          `Failed to generate valid phase ${skeleton.phase_number} after ${MAX_PHASE_RETRIES} retries.`,
          phaseLabel,
          {
            validation_findings: lastFindings.map((f) => ({
              code: f.code,
              message: f.message,
            })),
          },
        );
      }

      validatedPhases.push(generatedPhase);
      priorSummaries.push(
        summarisePhase({ ...skeleton, weeks: generatedPhase.weeks }),
      );
      durations[phaseLabel] = now() - phaseStart;

      log.debug('ai_generation_phase_complete', {
        phase: skeleton.phase_number,
        requestId: input.requestId,
      });
    }

    break outer;
  }

  // Assembly
  const programme = assembleProgramme({
    strategy,
    phases: validatedPhases,
    startDate: input.startDate,
    startWeightKg: input.profile.source.current_weight_kg,
    targetWeightKg: input.profile.source.target_weight_kg,
    exerciseLibraryVersion: input.exerciseLibraryVersion,
    validationRuleVersion: LONGITUDINAL_VALIDATION_RULE_VERSION,
  });

  return {
    programme,
    strategy,
    phases: validatedPhases,
    stage_durations_ms: durations,
    total_input_tokens: totalInput,
    total_output_tokens: totalOutput,
  };
};
