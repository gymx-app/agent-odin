import { z } from 'zod';
import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import { readJsonBody } from '../../src/infrastructure/http/request-body.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';
import { successResult } from '../../src/infrastructure/http/api-response.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { requireAuthenticatedUser } from '../../src/infrastructure/supabase/auth.js';
import {
  createApiDependencies,
  createRepositories,
  type ApiDependencies,
} from '../../src/api/dependencies.js';
import { generateProgrammeForUser } from '../../src/application/programme-generation.service.js';
import { programmeResponseData } from '../../src/application/programme-response.js';

const generateRequestSchema = z
  .object({
    replace_existing_draft: z.boolean().default(false),
    refinement_mode: z
      .enum(['deterministic', 'llm_optional', 'llm_required'])
      .default('deterministic'),
  })
  .strict()
  .default({ replace_existing_draft: false });

const firstHeaderValue = (
  value: HttpRequest['headers'][string],
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const createGenerateHandler = (
  appConfig: AppConfig = config,
  dependencies: ApiDependencies = createApiDependencies(appConfig),
) =>
  createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request, context) => {
      const user = await requireAuthenticatedUser(
        request,
        dependencies.authClient,
      );
      const body = await readJsonBody(request, generateRequestSchema);
      const idempotencyKey = firstHeaderValue(
        request.headers['idempotency-key'],
      );
      const result = await generateProgrammeForUser(
        user.id,
        {
          replace_existing_draft: body.replace_existing_draft,
          refinement_mode: body.refinement_mode,
          endpoint: '/api/odin/generate',
          ...(idempotencyKey ? { idempotencyKey } : {}),
        },
        {
          requestId: context.requestId,
          configuredModel: appConfig.openaiModel,
          refinementUnavailableReason: appConfig.llmRefinementEnabled
            ? 'OPENAI_CONFIGURATION_MISSING'
            : 'LLM_REFINEMENT_DISABLED',
          ...(dependencies.refinementProvider
            ? { refinementProvider: dependencies.refinementProvider }
            : {}),
          ...createRepositories(dependencies.adminClient),
        },
      );

      return successResult(
        programmeResponseData(result.saved),
        result.replayed ? 200 : 201,
      );
    },
  });

export default async function generate(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGenerateHandler(config)(request, response);
}
