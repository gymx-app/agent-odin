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
import {
  describeSubstitutionMatch,
  findExerciseSubstitutions,
  type ExerciseSubstitution,
} from '../../src/exercises/substitutions.js';
import { odinError } from '../../src/shared/errors/odin-errors.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';

// Below this many *resolvable* precomputed options, the precomputed list is
// treated as too thin to be useful and we fall back to a live search.
const MINIMUM_PRECOMPUTED_OPTIONS = 2;
const FALLBACK_OPTION_LIMIT = 5;

const swapOptionsRequestSchema = z.object({
  exercise_id: z.string().min(1),
  // Pass-through only — agent-odin has no independent read access to gx's
  // persisted programmes (see Authority Boundary), so this is never used to
  // look anything up. It's accepted so callers can echo it in logs/telemetry.
  programme_id: z.string().min(1).optional(),
  substitution_options: z
    .object({ approved_exercise_ids: z.array(z.string()) })
    .nullable()
    .optional(),
  athlete: AthleteInputV2Schema,
});

const toOption = ({ exercise, reasons, score }: ExerciseSubstitution) => ({
  exercise_id: exercise.id,
  name: exercise.display_name ?? exercise.name,
  equipment: exercise.equipment,
  reasons,
  score,
});

export const createSwapOptionsHandler = (appConfig: AppConfig = config) => {
  const authClient = createSupabaseAuthClient(appConfig);

  return createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      await requireAuthenticatedUser(request, authClient);

      const body = await readJsonBody(
        request,
        swapOptionsRequestSchema,
        REQUEST_BODY_LIMITS.profile,
      );

      const exerciseById = new Map<string, Exercise>(
        seedExercises.map((exercise) => [exercise.id, exercise]),
      );
      const sourceExercise = exerciseById.get(body.exercise_id);

      if (!sourceExercise) {
        throw odinError(
          'EXERCISE_NOT_FOUND',
          'Exercise is not in the approved library.',
          404,
          { exercise_id: body.exercise_id },
        );
      }

      const normalizedProfile = normalizeAthlete(
        mapAthleteInputV2ToBase(body.athlete),
      );

      // Default path: trust the prescription's precomputed shortlist
      // (already vetted, already ranked, at plan-build time) — no live
      // search needed for the common case. We only re-derive *why* each one
      // matched, via the same scoring function findExerciseSubstitutions
      // uses, rather than re-running the eligibility/equipment search.
      const precomputed = (body.substitution_options?.approved_exercise_ids ?? [])
        .map((id) => exerciseById.get(id))
        .filter((exercise): exercise is Exercise => exercise !== undefined)
        .map((exercise) => ({
          exercise,
          ...describeSubstitutionMatch(sourceExercise, exercise),
        }));

      const usedFallback = precomputed.length < MINIMUM_PRECOMPUTED_OPTIONS;
      const options = usedFallback
        ? findExerciseSubstitutions(
            sourceExercise,
            seedExercises,
            normalizedProfile,
          ).slice(0, FALLBACK_OPTION_LIMIT)
        : precomputed;

      return successResponse({
        source_exercise_id: sourceExercise.id,
        used_fallback: usedFallback,
        options: options.map(toOption),
      });
    },
  });
};

export default async function swapOptions(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createSwapOptionsHandler(config)(request, response);
}
