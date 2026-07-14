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
import { evaluateReadiness } from '../../src/planning/fatigue/readiness-evaluator.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';

const completedSetSchema = z.object({
  target_reps: z.number().int().positive(),
  rpe_ceiling: z.number().min(1).max(10),
  reps_achieved: z.number().int().nonnegative(),
  rpe_reported: z.number().min(1).max(10),
});

const readinessCheckRequestSchema = z.object({
  // The last few sessions' completed-set data, oldest first — agent-odin
  // has no independent read access to gx's persisted session history
  // (see Authority Boundary in swap-options.ts), so this is supplied
  // fresh on every call rather than looked up.
  recent_sessions: z
    .array(z.object({ completed_sets: z.array(completedSetSchema).min(1) }))
    .min(1),
  programme_id: z.string().min(1).optional(),
  athlete: AthleteInputV2Schema,
});

export const createReadinessCheckHandler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      await requireAuthenticatedUser(request, authClient);

      const body = await readJsonBody(
        request,
        readinessCheckRequestSchema,
        REQUEST_BODY_LIMITS.profile,
      );

      const assessment = evaluateReadiness(body.recent_sessions);

      return successResponse(assessment);
    },
  });
};

export default async function readinessCheck(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createReadinessCheckHandler(config)(request, response);
}
