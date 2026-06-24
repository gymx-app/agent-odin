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
import { createOpenAIClient } from '../../src/llm/openai-client.js';
import { OpenAIAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/openai-ai-programme-generation-provider.js';
import { AnthropicAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/anthropic-ai-programme-generation-provider.js';
import {
  buildAiStrategyContext,
  buildAiPhaseContext,
  summarisePhase,
} from '../../src/llm/ai-generation/ai-generation-context-builder.js';
import { createToolExecutor } from '../../src/llm/ai-generation/agent-tool-executor.js';
import { assembleProgramme } from '../../src/llm/ai-generation/ai-programme-assembler.js';
import { validatePhaseInIsolation } from '../../src/llm/ai-generation/validate-phase-in-isolation.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import { refineV2Programme } from '../../src/application/v2-programme-refinement.service.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../../src/validation/longitudinal-validation-registry.js';
import { AiStrategyOutputSchema, AiPhaseOutputSchema } from '../../src/llm/ai-generation/ai-generation.schema.js';
import type { AiProgrammeGenerationProvider } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { HttpRequest, HttpResponse } from '../../src/infrastructure/http/types.js';
import type { LongitudinalOdinProgramme } from '../../src/domain/programme/programme.types.js';

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
    step: z.literal('phase'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phase_index: z.number().int().nonnegative(),
    prior_phase_summaries: z.array(z.any()).default([]),
  }),
  z.object({
    step: z.literal('assemble'),
    athlete: AthleteInputSchema,
    strategy: z.any(),
    phases: z.array(z.any()).min(1),
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

      if (body.step === 'phase') {
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

        let reasoningOutput: string | undefined;
        let reasoningUsage = { inputTokens: 0, outputTokens: 0 };
        if (provider.generateReasoning) {
          const reasoningResult = await provider.generateReasoning(phaseCtx, {
            requestId: context.requestId,
            toolExecutor,
          });
          reasoningOutput = reasoningResult.reasoning;
          reasoningUsage = {
            inputTokens: reasoningResult.usage.inputTokens ?? 0,
            outputTokens: reasoningResult.usage.outputTokens ?? 0,
          };
        }

        const result = await provider.generatePhase(phaseCtx, {
          requestId: context.requestId,
          toolExecutor,
          ...(reasoningOutput !== undefined ? { reasoningOutput } : {}),
        });

        const phase = result.output;
        const summary = summarisePhase({ ...skeleton, weeks: phase.weeks });

        return successResponse({
          step: 'phase',
          phase_index: body.phase_index,
          phase,
          summary,
          usage: {
            inputTokens: (result.usage.inputTokens ?? 0) + reasoningUsage.inputTokens,
            outputTokens: (result.usage.outputTokens ?? 0) + reasoningUsage.outputTokens,
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
