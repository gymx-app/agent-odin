import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import { readJsonBody } from '../../src/infrastructure/http/request-body.js';
import { REQUEST_BODY_LIMITS } from '../../src/infrastructure/http/request-limits.js';
import { successResponse } from '../../src/infrastructure/http/api-response.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { requireAuthenticatedUser } from '../../src/infrastructure/supabase/auth.js';
import { createSupabaseAuthClient } from '../../src/infrastructure/supabase/auth-client.js';
import { AthleteInputV2Schema } from '../../src/domain/athlete/athlete-input-v2.schema.js';
import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';
import {
  ProgrammePhaseSchema,
  ProgrammeWeekSchema,
} from '../../src/domain/programme/longitudinal-programme.schema.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { odinError } from '../../src/shared/errors/odin-errors.js';
import { BadRequestError } from '../../src/shared/errors/http-errors.js';
import { AppError } from '../../src/shared/errors/app-error.js';
import { OpenAIAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/openai-ai-programme-generation-provider.js';
import { AnthropicAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/anthropic-ai-programme-generation-provider.js';
import {
  buildAiStrategyContextV2,
  buildAiPhaseContextV2,
  type AiAthleteContextExtrasV2,
} from '../../src/llm/ai-generation/ai-generation-context-builder.js';
import { createToolExecutor } from '../../src/llm/ai-generation/agent-tool-executor.js';
import { assembleProgramme } from '../../src/llm/ai-generation/ai-programme-assembler.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../../src/validation/longitudinal-validation-registry.js';
import { AiStrategyOutputSchema } from '../../src/llm/ai-generation/ai-generation.schema.js';
import type { AiStrategyOutput } from '../../src/llm/ai-generation/ai-generation.types.js';
import { buildProgrammeWithRepair } from '../../src/planning/longitudinal-programme-planner.js';
import { applyWeightPrescription } from '../../src/planning/weight-prescription.js';
import { buildDayZeroBaselineSession } from '../../src/planning/baseline/baseline-session-builder.js';
import { buildRationaleSummary } from '../../src/planning/rationale-summary.js';
import { interpretUnknownInjuries } from '../../src/normalization/injury-interpreter.js';
import { createSupabaseAdminClient } from '../../src/infrastructure/supabase/admin-client.js';
import { checkRateLimit, logGeneration } from '../../src/infrastructure/supabase/generation-log.js';
import { aiStrategySystemPromptV2 } from '../../src/llm/ai-generation/ai-generation-strategy-prompt-v2.js';
import type { AiProgrammeGenerationProvider } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { HttpRequest, HttpResponse } from '../../src/infrastructure/http/types.js';

const PLANNER_VERSION = 'ai_agent_v2' as const;

const PhaseSummarySchema = z.object({
  phase_id: z.string().min(1),
  phase_type: z.string().min(1),
  objective: z.string().min(1),
  exercises_used: z.array(z.string()),
  volume_per_muscle_group: z.record(z.number()),
  progression_model: z.string().min(1),
});

const ToolConversationItemSchema = z.record(z.unknown());

const stripNulls = (obj: unknown): unknown => {
  if (obj === null) return undefined;
  if (Array.isArray(obj)) return obj.map(stripNulls);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const stripped = stripNulls(v);
      if (stripped !== undefined) result[k] = stripped;
    }
    return result;
  }
  return obj;
};

const DAY_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

// Used for phase_prep/reasoning/tools/week steps where strategy comes from the client.
// For the build step, use coerceStrategy (more lenient — LLM may null optional fields).
const parseStrategy = (raw: unknown): z.infer<typeof AiStrategyOutputSchema> => {
  try {
    return AiStrategyOutputSchema.parse(stripNulls(raw));
  } catch (err) {
    throw new BadRequestError({
      message: `Strategy validation failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
};

// Lenient strategy coercion for the build step: fixes nulled optional fields that the
// LLM may output (OpenAI schema converts optional→nullable, stripNulls then removes them,
// but CalendarSchema.superRefine rejects missing day_of_week on weekly cycles).
const coerceStrategy = (raw: unknown): AiStrategyOutput => {
  const stripped = stripNulls(raw) as Record<string, unknown>;
  const calendar = stripped.calendar as Record<string, unknown> | undefined;
  if (calendar?.cycle_type === 'weekly' && Array.isArray(calendar.days)) {
    calendar.days = (calendar.days as Array<Record<string, unknown>>).map((day, i) => {
      if (day.day_of_week === undefined || day.day_of_week === null) {
        return { ...day, day_of_week: DAY_OF_WEEK[i % 7] };
      }
      return day;
    });
  }
  return stripped as unknown as AiStrategyOutput;
};

const stepRequestSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('strategy'),
    athlete: AthleteInputV2Schema,
  }),
  z.object({
    step: z.literal('phase_prep'),
    athlete: AthleteInputV2Schema,
    strategy: AiStrategyOutputSchema,
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(PhaseSummarySchema).default([]),
  }),
  z.object({
    step: z.literal('phase_reasoning'),
    athlete: AthleteInputV2Schema,
    strategy: AiStrategyOutputSchema,
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(PhaseSummarySchema).default([]),
  }),
  z.object({
    step: z.literal('phase_tools'),
    athlete: AthleteInputV2Schema,
    strategy: AiStrategyOutputSchema,
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(PhaseSummarySchema).default([]),
    reasoning: z.string().optional(),
  }),
  z.object({
    step: z.literal('phase_week'),
    athlete: AthleteInputV2Schema,
    strategy: AiStrategyOutputSchema,
    phase_index: z.number().int().nonnegative(),
    week_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(PhaseSummarySchema).default([]),
    reasoning: z.string().optional(),
    tool_conversation: z.array(ToolConversationItemSchema).default([]),
    prior_weeks: z.array(ProgrammeWeekSchema).default([]),
    previous_response_id: z.string().optional(),
  }),
  z.object({
    step: z.literal('assemble'),
    athlete: AthleteInputV2Schema,
    strategy: z.record(z.unknown()),
    phases: z.array(ProgrammePhaseSchema).min(1),
  }),
  z.object({
    step: z.literal('build'),
    athlete: AthleteInputV2Schema,
    strategy: z.record(z.unknown()),
  }),
]);

const getProvider = (appConfig: AppConfig): AiProgrammeGenerationProvider => {
  if (appConfig.aiGenerationProvider === 'anthropic' && appConfig.anthropicApiKey) {
    return new AnthropicAiProgrammeGenerationProvider(
      new Anthropic({
        apiKey: appConfig.anthropicApiKey,
        timeout: appConfig.anthropicTimeoutMs,
        maxRetries: 0,
      }),
      appConfig,
    );
  }

  if (appConfig.openaiApiKey) {
    return new OpenAIAiProgrammeGenerationProvider(
      new OpenAI({
        apiKey: appConfig.openaiApiKey,
        timeout: appConfig.openaiGenerationTimeoutMs,
        maxRetries: 0,
      }),
      appConfig,
    );
  }

  throw odinError('AI_GENERATION_PROVIDER_MISSING', 'No AI generation provider configured.', 500);
};

export const createGenerateProgrammeV2Handler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);
  const adminClient = createSupabaseAdminClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request, context) => {
      const user = await requireAuthenticatedUser(request, authClient);
      const body = await readJsonBody(request, stepRequestSchema, REQUEST_BODY_LIMITS.preview);

      if (body.athlete.medical_conditions?.includes('pregnancy_postpartum')) {
        throw odinError(
          'PREGNANCY_POSTPARTUM_BLOCKED',
          'Programme generation is not available during pregnancy or postpartum. Please consult a certified pre/postnatal trainer or your physician before beginning structured training.',
          400,
        );
      }

      const provider = getProvider(appConfig);
      const athleteInput = {
        ...body.athlete,
        injuries: await interpretUnknownInjuries(
          body.athlete.injuries.map((injury) => ({
            area: injury.area,
            severity: injury.modification,
            notes: injury.notes ?? '',
          })),
          appConfig,
        ),
      };
      const normalized = normalizeAthlete(athleteInput as unknown as AthleteInput);
      const toolExecutor = createToolExecutor(seedExercises, normalized);
      const athleteExtras: AiAthleteContextExtrasV2 = {
        lifestyle_tags: body.athlete.lifestyle_tags,
        occupation: body.athlete.occupation,
        medical_conditions: body.athlete.medical_conditions,
      };

      if (body.step === 'strategy') {
        await checkRateLimit(user.id, 'strategy', adminClient, appConfig.rateLimitStrategyPerDay);

        const strategyCtx = buildAiStrategyContextV2(
          normalized,
          seedExercises,
          body.athlete.goal_parameters as Record<string, unknown> | undefined,
          athleteExtras,
        );
        const result = await provider.generateStrategy(strategyCtx, {
          requestId: context.requestId,
          strategySystemPrompt: aiStrategySystemPromptV2,
        });

        void logGeneration(adminClient, {
          user_id: user.id,
          step: 'strategy',
          tokens_input: result.usage.inputTokens ?? 0,
          tokens_output: result.usage.outputTokens ?? 0,
          repair_attempted: false,
          athlete_goal: body.athlete.goal,
        });

        return successResponse({
          step: 'strategy',
          strategy: result.output,
          usage: result.usage,
        });
      }

      if (body.step === 'phase_prep') {
        const strategy = parseStrategy(body.strategy);
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContextV2(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
          athleteExtras,
        );

        let reasoning: string | null = null;
        let reasoningInputTokens = 0;
        let reasoningOutputTokens = 0;

        if (provider.generateReasoning) {
          const reasoningResult = await provider.generateReasoning(phaseCtx, {
            requestId: context.requestId,
            toolExecutor,
          });
          reasoning = reasoningResult.reasoning;
          reasoningInputTokens = reasoningResult.usage.inputTokens ?? 0;
          reasoningOutputTokens = reasoningResult.usage.outputTokens ?? 0;
        }

        const toolResult = await provider.generatePhase(phaseCtx, {
          requestId: context.requestId,
          toolExecutor,
          toolsOnly: true,
          ...(reasoning ? { reasoningOutput: reasoning } : {}),
        });

        const toolConversation = (toolResult as { toolConversation?: unknown[] }).toolConversation ?? [];

        return successResponse({
          step: 'phase_prep',
          phase_index: body.phase_index,
          reasoning,
          tool_conversation: toolConversation,
          usage: {
            inputTokens: reasoningInputTokens + (toolResult.usage.inputTokens ?? 0),
            outputTokens: reasoningOutputTokens + (toolResult.usage.outputTokens ?? 0),
          },
        });
      }

      if (body.step === 'phase_reasoning') {
        const strategy = parseStrategy(body.strategy);
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContextV2(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
          athleteExtras,
        );

        if (!provider.generateReasoning) {
          return successResponse({
            step: 'phase_reasoning',
            phase_index: body.phase_index,
            reasoning: null,
            usage: { inputTokens: 0, outputTokens: 0 },
          });
        }

        const reasoningResult = await provider.generateReasoning(phaseCtx, {
          requestId: context.requestId,
          toolExecutor,
        });

        return successResponse({
          step: 'phase_reasoning',
          phase_index: body.phase_index,
          reasoning: reasoningResult.reasoning,
          usage: {
            inputTokens: reasoningResult.usage.inputTokens ?? 0,
            outputTokens: reasoningResult.usage.outputTokens ?? 0,
          },
        });
      }

      if (body.step === 'phase_tools') {
        const strategy = parseStrategy(body.strategy);
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContextV2(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
          athleteExtras,
        );

        const result = await provider.generatePhase(phaseCtx, {
          requestId: context.requestId,
          toolExecutor,
          toolsOnly: true,
          ...(body.reasoning ? { reasoningOutput: body.reasoning } : {}),
        });

        const toolConversation = (result as { toolConversation?: unknown[] }).toolConversation ?? [];

        return successResponse({
          step: 'phase_tools',
          phase_index: body.phase_index,
          tool_conversation: toolConversation,
          usage: {
            inputTokens: result.usage.inputTokens ?? 0,
            outputTokens: result.usage.outputTokens ?? 0,
          },
        });
      }

      if (body.step === 'phase_week') {
        const stripped = stripNulls(body.strategy) as {
          phase_skeletons: Array<{ start_week: number; weeks_count: number }>;
          fatigue_management_policy: { planned_deload_weeks: number[] };
        };
        const skeleton = stripped.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const weekNumber = skeleton.start_week + body.week_index;
        const isDeload = stripped.fatigue_management_policy.planned_deload_weeks.includes(weekNumber);

        const weekPrompt = [
          `Generate ONLY week ${weekNumber} (week_index ${body.week_index + 1} of ${skeleton.weeks_count} in this phase).`,
          `week_number must be ${weekNumber}. week_id should be "W${weekNumber}".`,
          isDeload ? 'This is a DELOAD week — apply deload adjustments from fatigue_management_policy.' : '',
          body.prior_weeks.length > 0
            ? `Prior weeks already generated: ${JSON.stringify(body.prior_weeks.map((w: { week_number: number; week_type: string }) => ({ week_number: w.week_number, week_type: w.week_type })))}`
            : '',
          'Output a single JSON object representing this one week. Follow the ProgrammeWeekSchema exactly.',
        ].filter(Boolean).join('\n');

        if (!provider.generateWeek) {
          throw odinError('AI_GENERATION_PROVIDER_MISSING', 'Provider does not support week generation.', 500);
        }

        const weekGenCtx: import('../../src/llm/ai-generation/ai-generation.types.js').AiWeekGenerationContext = {
          phaseContext: {},
          weekPrompt,
        };

        if (body.previous_response_id) {
          weekGenCtx.previousResponseId = body.previous_response_id;
        } else {
          const fullStrategy = parseStrategy(stripped);
          const fullSkeleton = fullStrategy.phase_skeletons[body.phase_index]!;
          const phaseCtx = buildAiPhaseContextV2(
            normalized,
            fullStrategy,
            fullSkeleton,
            seedExercises,
            body.prior_phase_summaries,
            athleteExtras,
          );
          weekGenCtx.phaseContext = phaseCtx;
          if (body.reasoning) weekGenCtx.reasoning = body.reasoning;
          if (body.tool_conversation.length > 0) weekGenCtx.toolConversation = body.tool_conversation;
        }

        const weekResult = await provider.generateWeek(
          weekGenCtx,
          { requestId: context.requestId },
        );

        return successResponse({
          step: 'phase_week',
          phase_index: body.phase_index,
          week_index: body.week_index,
          week: weekResult.output,
          response_id: weekResult.responseId,
          usage: {
            inputTokens: weekResult.usage.inputTokens ?? 0,
            outputTokens: weekResult.usage.outputTokens ?? 0,
          },
        });
      }

      if (body.step === 'build') {
        const strategy = coerceStrategy(body.strategy);
        const strategyCtx = buildAiStrategyContextV2(
          normalized,
          seedExercises,
          undefined,
          athleteExtras,
        );
        let buildResult: Awaited<ReturnType<typeof buildProgrammeWithRepair>>;
        try {
          buildResult = await buildProgrammeWithRepair(
            normalized,
            seedExercises,
            strategy,
            provider,
            strategyCtx,
            { startDate: new Date().toISOString().slice(0, 10) },
          );
        } catch (err) {
          if (err instanceof AppError) throw err;
          throw odinError(
            'PROGRAMME_BUILD_FAILED',
            err instanceof Error ? err.message : 'Programme build failed.',
            500,
          );
        }
        const { validation, repair_log } = buildResult;
        const programme = {
          ...buildResult.programme,
          phases: applyWeightPrescription(buildResult.programme.phases, {
            baseline_path: body.athlete.baseline_path,
            known_lifts: body.athlete.known_lifts,
            goal: body.athlete.goal,
          }),
        };

        const rationale = buildRationaleSummary(strategy, programme);
        const repairAttempted = repair_log.length > 0;

        void logGeneration(adminClient, {
          user_id: user.id,
          step: 'build',
          tokens_input: 0,
          tokens_output: 0,
          repair_attempted: repairAttempted,
          athlete_goal: body.athlete.goal,
        });

        return successResponse({
          step: 'build',
          source: 'ai_generated' as const,
          planner_version: PLANNER_VERSION,
          schema_version: '2.0' as const,
          programme,
          baseline_session:
            body.athlete.baseline_path === 'day_one_test'
              ? buildDayZeroBaselineSession(programme)
              : null,
          validation,
          rationale,
          refinement: {
            requested: false,
            attempted: repairAttempted,
            applied: repairAttempted && repair_log.some((r) => r.repaired),
            retry_attempted: repairAttempted,
            status: repairAttempted ? 'self_repair' : 'not_requested',
            reason_code: null,
          },
          generation: {
            planner_version: PLANNER_VERSION,
            schema_version: '2.0' as const,
            validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
            exercise_library_version: 'approved-library-v1',
            repair_attempted: validation.repair?.attempted ?? repairAttempted,
            repair_applied: validation.repair?.applied ?? (repairAttempted && repair_log.some((r) => r.repaired)),
            repair_log,
          },
        });
      }

      if (body.step === 'assemble') {
        const strategy = parseStrategy(body.strategy);
        const phases = body.phases;

        const programme = assembleProgramme({
          strategy,
          phases,
          startDate: new Date().toISOString().slice(0, 10),
          startWeightKg: normalized.source.current_weight_kg,
          targetWeightKg: normalized.source.target_weight_kg,
          exerciseLibraryVersion: 'approved-library-v1',
          validationRuleVersion: LONGITUDINAL_VALIDATION_RULE_VERSION,
        });

        const fullValidation = programmeValidationService.validateAndRepairVersioned({
          programme,
          profile: normalized,
          exercises: seedExercises,
        });

        return successResponse({
          step: 'assemble',
          source: 'ai_generated' as const,
          planner_version: PLANNER_VERSION,
          schema_version: '2.0' as const,
          programme: fullValidation.programme,
          baseline_session:
            body.athlete.baseline_path === 'day_one_test'
              ? buildDayZeroBaselineSession(fullValidation.programme)
              : null,
          validation: fullValidation.validation,
          refinement: {
            requested: false,
            attempted: false,
            applied: false,
            retry_attempted: false,
            status: 'not_requested',
            reason_code: null,
          },
          generation: {
            planner_version: PLANNER_VERSION,
            schema_version: '2.0' as const,
            validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
            exercise_library_version: 'approved-library-v1',
            repair_attempted: fullValidation.validation.repair?.attempted ?? false,
            repair_applied: fullValidation.validation.repair?.applied ?? false,
          },
        });
      }

      throw odinError('INVALID_STEP', 'Unknown step.', 400);
    },
  });
};

export default async function generateProgrammeV2(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGenerateProgrammeV2Handler(config)(request, response);
}
