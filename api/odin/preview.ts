import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import { readJsonBody } from '../../src/infrastructure/http/request-body.js';
import { REQUEST_BODY_LIMITS } from '../../src/infrastructure/http/request-limits.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';
import { successResponse } from '../../src/infrastructure/http/api-response.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { requireAuthenticatedUser } from '../../src/infrastructure/supabase/auth.js';
import { createSupabaseAuthClient } from '../../src/infrastructure/supabase/auth-client.js';
import type { SupabaseAuthClientLike } from '../../src/infrastructure/supabase/supabase.types.js';
import { AthleteInputSchema } from '../../src/domain/athlete/athlete-input.schema.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { previewProgramme } from '../../src/application/programme-preview.service.js';
import type { ProgrammeRefinementProvider } from '../../src/llm/programme-refinement-provider.js';
import type { V2ProgrammeRefinementProvider } from '../../src/llm/v2-programme-refinement-provider.js';
import type { AiProgrammeGenerationProvider } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import { OpenAIProgrammeRefinementProvider } from '../../src/llm/openai-programme-refinement-provider.js';
import { OpenAIV2ProgrammeRefinementProvider } from '../../src/llm/openai-v2-programme-refinement-provider.js';
import { OpenAIAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/openai-ai-programme-generation-provider.js';
import { AnthropicAiProgrammeGenerationProvider } from '../../src/llm/ai-generation/anthropic-ai-programme-generation-provider.js';
import { createOpenAIClient } from '../../src/llm/openai-client.js';
import { PlannerVersionSchema } from '../../src/domain/programme/planner-version.js';
import { odinError } from '../../src/shared/errors/odin-errors.js';

const previewRequestSchema = z
  .object({
    athlete: AthleteInputSchema,
    refinement_mode: z
      .enum(['deterministic', 'llm_optional', 'llm_required'])
      .default('deterministic'),
    planner_version: z.string().trim().min(1).optional(),
    start_date: z.string().date().optional(),
  })
  .strict();

export type PreviewDependencies = {
  authClient: SupabaseAuthClientLike;
  refinementProvider?: ProgrammeRefinementProvider;
  v2RefinementProvider?: V2ProgrammeRefinementProvider;
  aiGenerationProvider?: AiProgrammeGenerationProvider;
};

const createPreviewDependencies = (
  appConfig: AppConfig,
): PreviewDependencies => {
  const dependencies: PreviewDependencies = {
    authClient: createSupabaseAuthClient(appConfig),
  };

  if (appConfig.llmRefinementEnabled || appConfig.aiAgentPlannerEnabled) {
    const client = createOpenAIClient(appConfig);
    if (appConfig.llmRefinementEnabled) {
      dependencies.refinementProvider = new OpenAIProgrammeRefinementProvider(
        client,
        appConfig,
      );
      dependencies.v2RefinementProvider =
        new OpenAIV2ProgrammeRefinementProvider(client, appConfig);
    }
    if (appConfig.aiAgentPlannerEnabled) {
      if (appConfig.aiGenerationProvider === 'anthropic' && appConfig.anthropicApiKey) {
        const anthropicClient = new Anthropic({
          apiKey: appConfig.anthropicApiKey,
          timeout: appConfig.anthropicTimeoutMs,
          maxRetries: 0,
        });
        dependencies.aiGenerationProvider =
          new AnthropicAiProgrammeGenerationProvider(anthropicClient, appConfig);
      } else if (appConfig.openaiApiKey) {
        const generationClient = new OpenAI({
          apiKey: appConfig.openaiApiKey,
          timeout: appConfig.openaiGenerationTimeoutMs,
          maxRetries: 0,
        });
        dependencies.aiGenerationProvider =
          new OpenAIAiProgrammeGenerationProvider(generationClient, appConfig);
      }
    }
  }

  return dependencies;
};

export const createPreviewHandler = (
  appConfig: AppConfig = config,
  dependencies: PreviewDependencies = createPreviewDependencies(appConfig),
) =>
  createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request, context) => {
      await requireAuthenticatedUser(request, dependencies.authClient);
      const body = await readJsonBody(
        request,
        previewRequestSchema,
        REQUEST_BODY_LIMITS.preview,
      );
      const requestedPlannerVersion = body.planner_version
        ? PlannerVersionSchema.safeParse(body.planner_version)
        : null;
      if (requestedPlannerVersion && !requestedPlannerVersion.success) {
        throw odinError(
          'PLANNER_VERSION_UNSUPPORTED',
          'Requested planner version is not supported.',
          400,
        );
      }
      const result = await previewProgramme(
        body.athlete,
        body.refinement_mode,
        {
          requestId: context.requestId,
          exercises: seedExercises,
          logger: createLogger(appConfig),
          generationTimeoutMs: appConfig.generationTimeoutMs,
          configuredModel: appConfig.openaiModel,
          ...(!appConfig.llmRefinementEnabled
            ? { refinementUnavailableReason: 'LLM_REFINEMENT_DISABLED' as const }
            : {}),
          ...(requestedPlannerVersion?.success
            ? { requestedPlannerVersion: requestedPlannerVersion.data }
            : {}),
          defaultPlannerVersion: appConfig.defaultPlannerVersion,
          longitudinalPlannerEnabled: appConfig.longitudinalPlannerEnabled,
          aiAgentPlannerEnabled: appConfig.aiAgentPlannerEnabled,
          allowedPlannerVersions: appConfig.allowedPlannerVersions,
          ...(body.start_date ? { startDate: body.start_date } : {}),
          exerciseLibraryVersion: 'approved-library-v1',
          ...(dependencies.refinementProvider
            ? { refinementProvider: dependencies.refinementProvider }
            : {}),
          ...(dependencies.v2RefinementProvider
            ? { v2RefinementProvider: dependencies.v2RefinementProvider }
            : {}),
          ...(dependencies.aiGenerationProvider
            ? { aiGenerationProvider: dependencies.aiGenerationProvider }
            : {}),
        },
      );

      return successResponse(result);
    },
  });

export default async function preview(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createPreviewHandler(config)(request, response);
}
