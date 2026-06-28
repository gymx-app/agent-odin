import { z } from 'zod';
import { config } from '../src/infrastructure/config/env.js';
import type { AppConfig } from '../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../src/infrastructure/http/handler.js';
import {
  createSuccessResponseSchema,
  successResponse,
} from '../src/infrastructure/http/api-response.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../src/infrastructure/http/types.js';
import { createLogger } from '../src/infrastructure/logging/logger.js';

export const healthDataSchema = z.object({
  service: z.literal('agent-odin'),
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
});

export const healthResponseSchema =
  createSuccessResponseSchema(healthDataSchema);

export const createHealthHandler = (appConfig: AppConfig = config) =>
  createEndpointHandler({
    allowedMethods: ['GET'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: () =>
      successResponse({
        service: 'agent-odin' as const,
        status: 'ok' as const,
        timestamp: new Date().toISOString(),
      }),
  });

export default async function health(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createHealthHandler(config)(request, response);
}
