import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { Logger } from '../infrastructure/logging/logger.js';
import type { ProgrammeRefinementProvider } from '../llm/programme-refinement-provider.js';
import type { V2ProgrammeRefinementProvider } from '../llm/v2-programme-refinement-provider.js';
import type { AiProgrammeGenerationProvider } from '../llm/ai-generation/ai-programme-generation-provider.js';
import {
  generateAiProgramme,
  AiGenerationError,
} from '../llm/ai-generation/ai-programme-generation.service.js';
import type {
  RefinementMetadata,
  RefinementMode,
} from '../llm/refinement.types.js';
import type { V2RefinementMetadata } from '../llm/v2-refinement.types.js';
import { normalizeAthlete } from '../normalization/athlete-normalizer.js';
import { buildBaselineProgramme } from '../planning/baseline-programme-planner.js';
import { buildLongitudinalProgramme } from '../planning/longitudinal-programme-planner.js';
import { odinError } from '../shared/errors/odin-errors.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../validation/programme-validator.js';
import { programmeValidationService } from '../validation/programme-validation.service.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { repairProgramme } from '../repair/programme-repair.service.js';
import { toSafeGenerationError } from './programme-generation/generation-errors.js';
import { refineProgramme } from './programme-refinement.service.js';
import { refineV2Programme } from './v2-programme-refinement.service.js';
import {
  resolvePlannerVersion,
  type PlannerVersion,
  type PlannerVersionResolution,
} from './programme-generation/planner-version.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../validation/longitudinal-validation-registry.js';

export type ProgrammePreviewResult = {
  source: 'deterministic' | 'llm_refined' | 'ai_generated';
  planner_version: PlannerVersion;
  schema_version: '1.0' | '2.0';
  programme: OdinProgramme | LongitudinalOdinProgramme;
  validation: ProgrammeValidationReport;
  refinement: RefinementMetadata | V2RefinementMetadata;
  generation: {
    planner_version: PlannerVersion;
    schema_version: '1.0' | '2.0';
    validation_rule_version: string;
    exercise_library_version: string;
    repair_attempted: boolean;
    repair_applied: boolean;
    planner_resolution: PlannerVersionResolution;
    stage_durations_ms: Record<string, number>;
    ai_generation?: {
      total_input_tokens: number;
      total_output_tokens: number;
      fallback_used: boolean;
      fallback_reason?: string;
    };
  };
};

export type ProgrammePreviewContext = {
  requestId: string;
  exercises: Exercise[];
  refinementProvider?: ProgrammeRefinementProvider;
  v2RefinementProvider?: V2ProgrammeRefinementProvider;
  configuredModel?: string | null;
  refinementUnavailableReason?:
    | 'LLM_REFINEMENT_DISABLED'
    | 'OPENAI_CONFIGURATION_MISSING';
  logger?: Logger;
  generationTimeoutMs?: number;
  requestedPlannerVersion?: PlannerVersion;
  defaultPlannerVersion?: PlannerVersion;
  longitudinalPlannerEnabled?: boolean;
  allowedPlannerVersions?: PlannerVersion[];
  startDate?: string;
  generatedAt?: string;
  exerciseLibraryVersion?: string;
  now?: () => number;
  longitudinalGenerator?: typeof buildLongitudinalProgramme;
  aiGenerationProvider?: AiProgrammeGenerationProvider;
  aiAgentPlannerEnabled?: boolean;
};

export const previewProgramme = async (
  athlete: AthleteInput,
  refinementMode: RefinementMode,
  context: ProgrammePreviewContext,
): Promise<ProgrammePreviewResult> => {
  const now = context.now ?? Date.now;
  const deadline = now() + (context.generationTimeoutMs ?? 60_000);
  const stageDurations: Record<string, number> = {};
  const resolution = resolvePlannerVersion({
    ...(context.requestedPlannerVersion
      ? { requestedVersion: context.requestedPlannerVersion }
      : {}),
    defaultVersion: context.defaultPlannerVersion ?? 'legacy_v1',
    longitudinalEnabled: context.longitudinalPlannerEnabled ?? false,
    aiAgentEnabled: context.aiAgentPlannerEnabled ?? false,
    allowedVersions: context.allowedPlannerVersions ?? [
      'legacy_v1',
      'longitudinal_v1',
      'ai_agent_v1',
    ],
  });
  const assertWithinDeadline = (stage: string): void => {
    if (now() > deadline) {
      throw odinError(
        'GENERATION_TIMEOUT',
        'Programme generation exceeded its deadline.',
        504,
        { stage, planner_version: resolution.selected_version },
      );
    }
  };
  const timed = async <T>(
    stage: string,
    operation: () => Promise<T> | T,
  ): Promise<T> => {
    assertWithinDeadline(stage);
    const startedAt = now();
    let success = false;
    try {
      const value = await operation();
      success = true;
      return value;
    } finally {
      const durationMs = Math.max(0, now() - startedAt);
      stageDurations[stage] = durationMs;
      context.logger?.info('preview stage completed', {
        requestId: context.requestId,
        plannerVersion: resolution.selected_version,
        stage,
        durationMs,
        success,
        warningCount: 0,
      });
    }
  };

  try {
    const normalized = await timed('athlete_normalization', () =>
      normalizeAthlete(athlete),
    );
    assertWithinDeadline('planner_resolution');
    if (resolution.selected_version === 'ai_agent_v1') {
      const exerciseLibraryVersion =
        context.exerciseLibraryVersion ?? 'approved-library-v1';
      const startDate =
        context.startDate ?? new Date(now()).toISOString().slice(0, 10);

      let aiResult: Awaited<ReturnType<typeof generateAiProgramme>> | null = null;
      let fallbackReason: string | undefined;

      if (!context.aiGenerationProvider) {
        fallbackReason = 'AI_GENERATION_PROVIDER_MISSING';
      } else {
        try {
          aiResult = await timed('ai_generation', () =>
            generateAiProgramme({
              profile: normalized,
              exercises: context.exercises,
              provider: context.aiGenerationProvider!,
              requestId: context.requestId,
              startDate,
              exerciseLibraryVersion,
              deadline,
              now: context.now,
              logger: context.logger ? { debug: (...args: unknown[]) => { context.logger!.debug(String(args[0] ?? 'ai_generation'), args[1] as Record<string, unknown> | undefined); } } : undefined,
            }),
          );
        } catch (error) {
          if (error instanceof AiGenerationError) {
            fallbackReason = `${error.code}:${error.stage}`;
            context.logger?.info('ai_generation_fallback', {
              requestId: context.requestId,
              reason: fallbackReason,
              stage: error.stage,
            });
          } else {
            const errorMessage = error instanceof Error ? error.message : String(error);
            fallbackReason = `AI_GENERATION_UNKNOWN_ERROR:${errorMessage}`;
            context.logger?.info('ai_generation_unknown_error', {
              requestId: context.requestId,
              error: errorMessage,
              errorName: error instanceof Error ? error.name : 'unknown',
            });
          }
        }
      }

      if (aiResult) {
        // Full validation + repair on assembled programme
        const fullValidation = programmeValidationService.validateAndRepairVersioned({
          programme: aiResult.programme,
          profile: normalized,
          exercises: context.exercises,
        });

        // Optional V2 refinement on the AI-generated programme
        assertWithinDeadline('v2_refinement');
        const v2RefinementResult = await timed('v2_refinement', () =>
          refineV2Programme({
            mode: refinementMode,
            baseline: fullValidation.programme as LongitudinalOdinProgramme,
            baselineValidation: fullValidation.validation,
            profile: normalized,
            exercises: context.exercises,
            configuredModel: context.configuredModel ?? null,
            unavailableReason:
              context.refinementUnavailableReason ??
              'OPENAI_CONFIGURATION_MISSING',
            requestId: context.requestId,
            ...(context.v2RefinementProvider
              ? { provider: context.v2RefinementProvider }
              : {}),
          }),
        );

        return {
          source: 'ai_generated',
          planner_version: 'ai_agent_v1',
          schema_version: '2.0',
          programme: v2RefinementResult.programme,
          validation: v2RefinementResult.validation,
          refinement: v2RefinementResult.refinement,
          generation: {
            planner_version: 'ai_agent_v1',
            schema_version: '2.0',
            validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
            exercise_library_version: exerciseLibraryVersion,
            repair_attempted: fullValidation.validation.repair?.attempted ?? false,
            repair_applied: fullValidation.validation.repair?.applied ?? false,
            planner_resolution: resolution,
            stage_durations_ms: {
              ...stageDurations,
              ...aiResult.stage_durations_ms,
            },
            ai_generation: {
              total_input_tokens: aiResult.total_input_tokens,
              total_output_tokens: aiResult.total_output_tokens,
              fallback_used: false,
            },
          },
        };
      }

      // Fallback to deterministic longitudinal pipeline
      context.logger?.info('ai_generation_deterministic_fallback', {
        requestId: context.requestId,
        fallbackReason,
      });
      const longitudinalGenerator =
        context.longitudinalGenerator ?? buildLongitudinalProgramme;
      const fallbackGenerated = await timed('longitudinal_generation', () =>
        longitudinalGenerator(normalized, context.exercises, {
          startDate,
          generatedAt: context.generatedAt ?? new Date(now()).toISOString(),
          exerciseLibraryVersion,
          stageRunner: <T>(stage: string, operation: () => T): T => {
            assertWithinDeadline(stage);
            const startedAt = now();
            let success = false;
            try {
              const value = operation();
              success = true;
              return value;
            } finally {
              const durationMs = Math.max(0, now() - startedAt);
              stageDurations[stage] = durationMs;
              context.logger?.info('preview stage completed', {
                requestId: context.requestId,
                plannerVersion: 'ai_agent_v1',
                stage,
                durationMs,
                success,
                warningCount: 0,
              });
            }
          },
        }),
      );

      if (!fallbackGenerated.validation.passed) {
        throw odinError(
          'GENERATED_PROGRAMME_INVALID',
          'Fallback longitudinal programme failed final validation.',
          422,
          {
            status: fallbackGenerated.validation.status,
            summary: fallbackGenerated.validation.summary,
          },
        );
      }

      return {
        source: 'deterministic',
        planner_version: 'ai_agent_v1',
        schema_version: '2.0',
        programme: fallbackGenerated.programme,
        validation: fallbackGenerated.validation,
        refinement: {
          requested: false,
          attempted: false,
          applied: false,
          retry_attempted: false,
          operation_count: 0,
          accepted_operation_types: [],
          status: 'not_requested' as const,
          reason_code: null,
        },
        generation: {
          planner_version: 'ai_agent_v1',
          schema_version: '2.0',
          validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
          exercise_library_version: exerciseLibraryVersion,
          repair_attempted: fallbackGenerated.validation.repair?.attempted ?? false,
          repair_applied: fallbackGenerated.validation.repair?.applied ?? false,
          planner_resolution: resolution,
          stage_durations_ms: stageDurations,
          ai_generation: {
            total_input_tokens: 0,
            total_output_tokens: 0,
            fallback_used: true,
            ...(fallbackReason ? { fallback_reason: fallbackReason } : {}),
          },
        },
      };
    }
    if (resolution.selected_version === 'longitudinal_v1') {
      const longitudinalGenerator =
        context.longitudinalGenerator ?? buildLongitudinalProgramme;
      const generated = await timed('longitudinal_generation', () =>
        longitudinalGenerator(normalized, context.exercises, {
          startDate:
            context.startDate ?? new Date(now()).toISOString().slice(0, 10),
          generatedAt: context.generatedAt ?? new Date(now()).toISOString(),
          exerciseLibraryVersion:
            context.exerciseLibraryVersion ?? 'approved-library-v1',
          stageRunner: <T>(stage: string, operation: () => T): T => {
            assertWithinDeadline(stage);
            const startedAt = now();
            let success = false;
            try {
              const value = operation();
              success = true;
              return value;
            } finally {
              const durationMs = Math.max(0, now() - startedAt);
              stageDurations[stage] = durationMs;
              context.logger?.info('preview stage completed', {
                requestId: context.requestId,
                plannerVersion: resolution.selected_version,
                stage,
                durationMs,
                success,
                warningCount: 0,
              });
            }
          },
        }),
      );
      if (!generated.validation.passed) {
        throw odinError(
          'GENERATED_PROGRAMME_INVALID',
          'Generated longitudinal programme failed final validation.',
          422,
          {
            status: generated.validation.status,
            summary: generated.validation.summary,
            finding_codes: generated.validation.findings.map(
              (finding) => finding.code,
            ),
          },
        );
      }
      assertWithinDeadline('v2_refinement');
      const v2RefinementResult = await timed('v2_refinement', () =>
        refineV2Programme({
          mode: refinementMode,
          baseline: generated.programme,
          baselineValidation: generated.validation,
          profile: normalized,
          exercises: context.exercises,
          configuredModel: context.configuredModel ?? null,
          unavailableReason:
            context.refinementUnavailableReason ??
            'OPENAI_CONFIGURATION_MISSING',
          requestId: context.requestId,
          ...(context.v2RefinementProvider
            ? { provider: context.v2RefinementProvider }
            : {}),
        }),
      );
      assertWithinDeadline('final_validation');
      return {
        source: v2RefinementResult.source,
        planner_version: 'longitudinal_v1',
        schema_version: '2.0',
        programme: v2RefinementResult.programme,
        validation: v2RefinementResult.validation,
        refinement: v2RefinementResult.refinement,
        generation: {
          planner_version: 'longitudinal_v1',
          schema_version: '2.0',
          validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
          exercise_library_version:
            context.exerciseLibraryVersion ?? 'approved-library-v1',
          repair_attempted: generated.validation.repair?.attempted ?? false,
          repair_applied: generated.validation.repair?.applied ?? false,
          planner_resolution: resolution,
          stage_durations_ms: stageDurations,
        },
      };
    }
    const baseline = await timed('legacy_planner', () =>
      buildBaselineProgramme(
        normalized,
        context.exercises,
        context.startDate
          ? { startDate: `${context.startDate}T00:00:00.000Z` }
          : {},
      ),
    );
    const baselineValidation = await timed('validator', () =>
      validateProgramme(baseline, normalized, context.exercises),
    );

    if (!baselineValidation.passed) {
      throw odinError(
        'GENERATED_PROGRAMME_INVALID',
        'Generated programme failed validation.',
        422,
        {
          status: baselineValidation.status,
          summary: baselineValidation.summary,
        },
      );
    }

    assertWithinDeadline('llm_refinement');
    const refinementResult = await timed('llm_refinement', () =>
      refineProgramme({
        mode: refinementMode,
        baseline,
        baselineValidation,
        profile: normalized,
        exercises: context.exercises,
        configuredModel: context.configuredModel ?? null,
        unavailableReason:
          context.refinementUnavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
        requestId: context.requestId,
        ...(context.refinementProvider
          ? { provider: context.refinementProvider }
          : {}),
      }),
    );
    assertWithinDeadline('response');

    return {
      source: refinementResult.source,
      planner_version: 'legacy_v1',
      schema_version: '1.0',
      programme: applyValidationSummary(
        refinementResult.programme,
        refinementResult.validation,
      ),
      validation: refinementResult.validation,
      refinement: refinementResult.refinement,
      generation: {
        planner_version: 'legacy_v1',
        schema_version: '1.0',
        validation_rule_version: 'programme-validation/v1',
        exercise_library_version:
          context.exerciseLibraryVersion ?? 'approved-library-v1',
        repair_attempted: false,
        repair_applied: false,
        planner_resolution: resolution,
        stage_durations_ms: stageDurations,
      },
    };
  } catch (error) {
    throw toSafeGenerationError(error);
  }
};
