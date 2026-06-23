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
  version: z.string().min(1),
  status: z.literal('ok'),
  default_planner_version: z.enum(['legacy_v1', 'longitudinal_v1', 'ai_agent_v1']),
  longitudinal_planner_enabled: z.boolean(),
  ai_agent_enabled: z.boolean(),
  openai_connected: z.boolean(),
  supported_planner_versions: z.array(z.enum(['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'])),
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
        version: appConfig.appVersion,
        status: 'ok' as const,
        default_planner_version: appConfig.defaultPlannerVersion,
        longitudinal_planner_enabled: appConfig.longitudinalPlannerEnabled,
        ai_agent_enabled: appConfig.aiAgentPlannerEnabled,
        openai_connected: !!(appConfig.openaiApiKey && appConfig.openaiGenerationModel),
        supported_planner_versions: appConfig.allowedPlannerVersions,
      }),
  });

export default async function health(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createHealthHandler(config)(request, response);
}
