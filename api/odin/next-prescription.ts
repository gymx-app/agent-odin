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
import { planNextPrescription } from '../../src/planning/feedback/next-prescription-planner.js';
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

const nextPrescriptionRequestSchema = z.object({
  exercise_id: z.string().min(1),
  // Every field below is echoed back from the prescription gx already
  // persisted — agent-odin has no independent read access to gx's
  // programmes (see Authority Boundary in swap-options.ts), so nothing
  // here is looked up, only computed from what's passed in.
  current_target_reps: z.number().int().positive(),
  progression_bounds: z
    .object({
      rep_min: z.number().int().positive(),
      rep_max: z.number().int().positive(),
    })
    .superRefine((bounds, ctx) => {
      if (bounds.rep_max < bounds.rep_min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'rep_max must be greater than or equal to rep_min',
          path: ['rep_max'],
        });
      }
    }),
  completed_sets: z.array(completedSetSchema).min(1),
  programme_id: z.string().min(1).optional(),
  athlete: AthleteInputV2Schema,
});

export const createNextPrescriptionHandler = (
  appConfig: AppConfig = config,
) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      await requireAuthenticatedUser(request, authClient);

      const body = await readJsonBody(
        request,
        nextPrescriptionRequestSchema,
        REQUEST_BODY_LIMITS.profile,
      );

      const result = planNextPrescription(
        body.completed_sets,
        body.current_target_reps,
        body.progression_bounds,
      );

      return successResponse({
        exercise_id: body.exercise_id,
        ...result,
      });
    },
  });
};

export default async function nextPrescription(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createNextPrescriptionHandler(config)(request, response);
}
