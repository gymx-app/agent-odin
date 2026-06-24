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
import { AthleteInputSchema } from '../../src/domain/athlete/athlete-input.schema.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { odinError } from '../../src/shared/errors/odin-errors.js';
import { OpenAIAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/openai-ai-programme-generation-provider.js';
import { AnthropicAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/anthropic-ai-programme-generation-provider.js';
import {
  buildAiStrategyContext,
  buildAiPhaseContext,
} from '../../src/llm/ai-generation/ai-generation-context-builder.js';
import { createToolExecutor } from '../../src/llm/ai-generation/agent-tool-executor.js';
import { assembleProgramme } from '../../src/llm/ai-generation/ai-programme-assembler.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../../src/validation/longitudinal-validation-registry.js';
import { AiStrategyOutputSchema } from '../../src/llm/ai-generation/ai-generation.schema.js';
import { buildProgrammeFromAiStrategy } from '../../src/planning/longitudinal-programme-planner.js';
import type { AiProgrammeGenerationProvider } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { HttpRequest, HttpResponse } from '../../src/infrastructure/http/types.js';

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

const stepRequestSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal('strategy'),
    athlete: AthleteInputSchema,
  }),
  z.object({
    step: z.literal('phase_prep'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(z.any()).default([]),
  }),
  z.object({
    step: z.literal('phase_reasoning'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(z.any()).default([]),
  }),
  z.object({
    step: z.literal('phase_tools'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(z.any()).default([]),
    reasoning: z.string().optional(),
  }),
  z.object({
    step: z.literal('phase_week'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phase_index: z.number().int().nonnegative(),
    week_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(z.any()).default([]),
    reasoning: z.string().optional(),
    tool_conversation: z.array(z.any()).default([]),
    prior_weeks: z.array(z.any()).default([]),
    previous_response_id: z.string().optional(),
  }),
  z.object({
    step: z.literal('assemble'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phases: z.array(z.any()).min(1),
  }),
  z.object({
    step: z.literal('build'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
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

export const createPreviewStepHandler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request, context) => {
      await requireAuthenticatedUser(request, authClient);
      const body = await readJsonBody(request, stepRequestSchema, REQUEST_BODY_LIMITS.preview);
      const provider = getProvider(appConfig);
      const normalized = normalizeAthlete(body.athlete);
      const toolExecutor = createToolExecutor(seedExercises, normalized);

      if (body.step === 'strategy') {
        const strategyCtx = buildAiStrategyContext(normalized, seedExercises);
        const result = await provider.generateStrategy(strategyCtx, {
          requestId: context.requestId,
        });
        return successResponse({
          step: 'strategy',
          strategy: result.output,
          usage: result.usage,
        });
      }

      if (body.step === 'phase_prep') {
        const strategy = AiStrategyOutputSchema.parse(stripNulls(body.strategy));
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContext(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
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
        const strategy = AiStrategyOutputSchema.parse(stripNulls(body.strategy));
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContext(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
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
        const strategy = AiStrategyOutputSchema.parse(stripNulls(body.strategy));
        const skeleton = strategy.phase_skeletons[body.phase_index];
        if (!skeleton) {
          throw odinError('INVALID_PHASE_INDEX', `Phase index ${body.phase_index} out of range.`, 400);
        }

        const phaseCtx = buildAiPhaseContext(
          normalized,
          strategy,
          skeleton,
          seedExercises,
          body.prior_phase_summaries,
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
          const fullStrategy = AiStrategyOutputSchema.parse(stripped);
          const fullSkeleton = fullStrategy.phase_skeletons[body.phase_index]!;
          const phaseCtx = buildAiPhaseContext(
            normalized,
            fullStrategy,
            fullSkeleton,
            seedExercises,
            body.prior_phase_summaries,
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
        const strategy = AiStrategyOutputSchema.parse(stripNulls(body.strategy));
        const { programme, validation } = buildProgrammeFromAiStrategy(
          normalized,
          seedExercises,
          strategy,
          { startDate: new Date().toISOString().slice(0, 10) },
        );

        return successResponse({
          step: 'build',
          source: 'ai_generated' as const,
          planner_version: 'ai_agent_v1' as const,
          schema_version: '2.0' as const,
          programme,
          validation,
          refinement: {
            requested: false,
            attempted: false,
            applied: false,
            retry_attempted: false,
            status: 'not_requested',
            reason_code: null,
          },
          generation: {
            planner_version: 'ai_agent_v1' as const,
            schema_version: '2.0' as const,
            validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
            exercise_library_version: 'approved-library-v1',
            repair_attempted: validation.repair?.attempted ?? false,
            repair_applied: validation.repair?.applied ?? false,
          },
        });
      }

      if (body.step === 'assemble') {
        const strategy = AiStrategyOutputSchema.parse(stripNulls(body.strategy));
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
          planner_version: 'ai_agent_v1' as const,
          schema_version: '2.0' as const,
          programme: fullValidation.programme,
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
            planner_version: 'ai_agent_v1' as const,
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

export default async function previewStep(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createPreviewStepHandler(config)(request, response);
}
