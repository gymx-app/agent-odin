import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { ExerciseLibraryRepository } from '../../src/repositories/exercise-library.repository.js';
import { createQueryClient } from './test-supabase-client.js';

describe('ExerciseLibraryRepository', () => {
  it('loads the validated active exercise library', async () => {
    const { client, calls } = createQueryClient({
      list: {
        data: seedExercises.map((exercise) => ({
          id: exercise.id,
          exercise_data: exercise,
          status: 'active',
          schema_version: 1,
        })),
        error: null,
      },
    });

    await expect(
      new ExerciseLibraryRepository(client).loadActiveApproved(),
    ).resolves.toHaveLength(seedExercises.length);
    expect(calls).toContainEqual({
      method: 'eq',
      args: ['status', 'active'],
    });
  });

  it('rejects table and canonical ID mismatches', async () => {
    const { client } = createQueryClient({
      list: {
        data: seedExercises.map((exercise, index) => ({
          id: index === 0 ? 'wrong_id' : exercise.id,
          exercise_data: exercise,
          status: 'active',
          schema_version: 1,
        })),
        error: null,
      },
    });

    await expect(
      new ExerciseLibraryRepository(client).loadActiveApproved(),
    ).rejects.toMatchObject({
      code: 'EXERCISE_LIBRARY_INVALID',
    });
  });

  it('does not silently skip malformed exercise JSON', async () => {
    const { client } = createQueryClient({
      list: {
        data: [
          {
            id: 'bad',
            exercise_data: { id: 'bad' },
            status: 'active',
            schema_version: 1,
          },
        ],
        error: null,
      },
    });

    await expect(
      new ExerciseLibraryRepository(client).loadActiveApproved(),
    ).rejects.toMatchObject({
      code: 'EXERCISE_LIBRARY_INVALID',
    });
  });
});
