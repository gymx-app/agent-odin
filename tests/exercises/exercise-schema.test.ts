import { describe, expect, it } from 'vitest';
import { ExerciseSchema } from '../../src/domain/exercise/exercise.schema.js';
import {
  createExercisePatch,
  findSeedExercise,
  zeroMovementDemands,
} from './test-exercise-utils.js';

describe('ExerciseSchema', () => {
  it('accepts a valid compound exercise', () => {
    expect(
      ExerciseSchema.safeParse(findSeedExercise('dumbbell_goblet_squat'))
        .success,
    ).toBe(true);
  });

  it('accepts a valid isolation exercise', () => {
    expect(
      ExerciseSchema.safeParse(findSeedExercise('dumbbell_biceps_curl'))
        .success,
    ).toBe(true);
  });

  it('accepts a valid cardio exercise', () => {
    expect(
      ExerciseSchema.safeParse(findSeedExercise('stationary_bike')).success,
    ).toBe(true);
  });

  it('rejects invalid ID format', () => {
    expect(
      ExerciseSchema.safeParse(createExercisePatch({ id: 'Goblet Squat' }))
        .success,
    ).toBe(false);
  });

  it('rejects duplicate primary and secondary muscles', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          primary_muscles: ['quadriceps'],
          secondary_muscles: ['quadriceps'],
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid fatigue scores', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          fatigue_cost: {
            systemic: 6,
            local: 1,
            axial: 1,
            grip: 1,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid movement demand scores', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          movement_demands: {
            ...zeroMovementDemands(),
            high_impact: 9,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid rep ranges', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          default_rep_range: {
            min: 12,
            max: 8,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid rest ranges', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          default_rest_seconds: {
            min: 120,
            max: 60,
          },
        }),
      ).success,
    ).toBe(false);
  });

  it('rejects cardio without a LISS pattern', () => {
    expect(
      ExerciseSchema.safeParse(
        createExercisePatch({
          exercise_type: 'cardio',
          movement_patterns: ['squat'],
        }),
      ).success,
    ).toBe(false);
  });
});
