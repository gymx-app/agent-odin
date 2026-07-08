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
import { mapAthleteInputV2ToBase } from '../../src/domain/athlete/athlete-input-v2-mapper.js';
import type { Exercise } from '../../src/domain/exercise/exercise.types.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { checkSubstitutionCandidate } from '../../src/validation/session-validator.js';
import { odinError, type OdinErrorCode } from '../../src/shared/errors/odin-errors.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';

const confirmSwapRequestSchema = z.object({
  exercise_id: z.string().min(1),
  chosen_alternative_id: z.string().min(1),
  // Pass-through only — see swap-options.ts for why this isn't looked up.
  programme_id: z.string().min(1).optional(),
  athlete: AthleteInputV2Schema,
});

export const createConfirmSwapHandler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      await requireAuthenticatedUser(request, authClient);

      const body = await readJsonBody(
        request,
        confirmSwapRequestSchema,
        REQUEST_BODY_LIMITS.profile,
      );

      const exerciseById = new Map<string, Exercise>(
        seedExercises.map((exercise) => [exercise.id, exercise]),
      );

      const normalizedProfile = normalizeAthlete(
        mapAthleteInputV2ToBase(body.athlete),
      );

      // Re-runs the exact same check session-validator applies to every
      // prescription's substitution_options — the frontend only ever shows
      // options getSwapOptions returned, but that response isn't trusted as
      // the last word here.
      const substitutionFinding = checkSubstitutionCandidate(
        body.exercise_id,
        body.chosen_alternative_id,
        exerciseById,
        normalizedProfile,
      );

      if (substitutionFinding) {
        throw odinError(
          substitutionFinding.code as OdinErrorCode,
          substitutionFinding.message,
          422,
          substitutionFinding,
        );
      }

      const chosen = exerciseById.get(body.chosen_alternative_id) as Exercise;

      return successResponse({
        valid: true as const,
        exercise_id: body.exercise_id,
        chosen_alternative: {
          exercise_id: chosen.id,
          name: chosen.display_name ?? chosen.name,
          equipment: chosen.equipment,
        },
      });
    },
  });
};

export default async function confirmSwap(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createConfirmSwapHandler(config)(request, response);
}
