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
import { OpenAIProgrammeRefinementProvider } from '../../src/llm/openai-programme-refinement-provider.js';
import { createOpenAIClient } from '../../src/llm/openai-client.js';

const previewRequestSchema = z
  .object({
    athlete: AthleteInputSchema,
    refinement_mode: z
      .enum(['deterministic', 'llm_optional', 'llm_required'])
      .default('deterministic'),
  })
  .strict();

export type PreviewDependencies = {
  authClient: SupabaseAuthClientLike;
  refinementProvider?: ProgrammeRefinementProvider;
};

const createPreviewDependencies = (
  appConfig: AppConfig,
): PreviewDependencies => {
  const dependencies: PreviewDependencies = {
    authClient: createSupabaseAuthClient(appConfig),
  };

  if (appConfig.llmRefinementEnabled) {
    dependencies.refinementProvider = new OpenAIProgrammeRefinementProvider(
      createOpenAIClient(appConfig),
      appConfig,
    );
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
      const result = await previewProgramme(
        body.athlete,
        body.refinement_mode,
        {
          requestId: context.requestId,
          exercises: seedExercises,
          logger: createLogger(appConfig),
          generationTimeoutMs: appConfig.generationTimeoutMs,
          configuredModel: appConfig.openaiModel,
          refinementUnavailableReason: appConfig.llmRefinementEnabled
            ? 'OPENAI_CONFIGURATION_MISSING'
            : 'LLM_REFINEMENT_DISABLED',
          ...(dependencies.refinementProvider
            ? { refinementProvider: dependencies.refinementProvider }
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
