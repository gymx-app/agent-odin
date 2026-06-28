import { ExerciseSchema } from '../domain/exercise/exercise.schema.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { validateExerciseLibrary } from '../exercises/library-validator.js';
import { odinError } from '../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';

type ExerciseLibraryRow = {
  id: string;
  exercise_data: unknown;
  status: string;
  schema_version: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let exerciseCache: { exercises: Exercise[]; expiresAt: number } | null = null;

export const clearExerciseLibraryCache = (): void => {
  exerciseCache = null;
};

export class ExerciseLibraryRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async loadActiveApproved(): Promise<Exercise[]> {
    if (exerciseCache && Date.now() < exerciseCache.expiresAt) {
      return exerciseCache.exercises;
    }

    const result = await this.client
      .from<ExerciseLibraryRow>('exercise_library')
      .select('id,exercise_data,status,schema_version')
      .eq('status', 'active');

    if (result.error || !result.data) {
      throw odinError(
        'EXERCISE_LIBRARY_INVALID',
        'Exercise library could not be loaded.',
        500,
      );
    }

    const exercises = result.data.map((row) => {
      const parsed = ExerciseSchema.safeParse(row.exercise_data);

      if (!parsed.success || parsed.data.id !== row.id) {
        throw odinError(
          'EXERCISE_LIBRARY_INVALID',
          'Exercise library contains invalid data.',
          500,
        );
      }

      return parsed.data;
    });

    const libraryResult = validateExerciseLibrary(exercises);

    if (!libraryResult.valid) {
      throw odinError(
        'EXERCISE_LIBRARY_INVALID',
        'Exercise library failed validation.',
        500,
        { issues: libraryResult.issues },
      );
    }

    exerciseCache = { exercises, expiresAt: Date.now() + CACHE_TTL_MS };
    return exercises;
  }
}
