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
import { odinError } from '../../src/shared/errors/odin-errors.js';
import { parseInBodyFile, type InBodyMediaType } from '../../src/llm/inbody/inbody-parser.js';
import type { HttpRequest, HttpResponse } from '../../src/infrastructure/http/types.js';

const requestSchema = z.object({
  file: z.string().min(1, 'file must be a non-empty base64 string'),
  media_type: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
});

export const createParseInBodyHandler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      await requireAuthenticatedUser(request, authClient);

      const body = await readJsonBody(request, requestSchema, REQUEST_BODY_LIMITS.inbodyParse);

      if (!appConfig.anthropicApiKey) {
        throw odinError(
          'INBODY_API_ERROR',
          'Anthropic API key is not configured.',
          503,
        );
      }

      const client = new Anthropic({
        apiKey: appConfig.anthropicApiKey,
        timeout: appConfig.anthropicTimeoutMs,
        maxRetries: 0,
      });

      const result = await parseInBodyFile(
        body.file,
        body.media_type as InBodyMediaType,
        client,
      );

      return successResponse(result);
    },
  });
};

export default async function parseInBody(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createParseInBodyHandler(config)(request, response);
}
