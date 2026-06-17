import { describe, expect, it } from 'vitest';
import { filterEligibleExercises } from '../../src/exercises/filtering.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from '../normalization/test-athletes.js';

describe('filterEligibleExercises', () => {
  const profile = normalizeAthlete(
    createAthlete({
      equipment: 'full_gym',
    }),
  );

  it('filters by movement pattern', () => {
    expect(
      filterEligibleExercises(seedExercises, profile, {
        movementPattern: 'squat',
      }).every(({ exercise }) => exercise.movement_patterns.includes('squat')),
    ).toBe(true);
  });

  it('filters by primary muscle', () => {
    expect(
      filterEligibleExercises(seedExercises, profile, {
        primaryMuscle: 'biceps',
      }).every(({ exercise }) => exercise.primary_muscles.includes('biceps')),
    ).toBe(true);
  });

  it('filters by maximum difficulty', () => {
    expect(
      filterEligibleExercises(seedExercises, profile, {
        maximumDifficulty: 'beginner',
      }).every(({ exercise }) => exercise.difficulty === 'beginner'),
    ).toBe(true);
  });

  it('can exclude modifiable exercises', () => {
    const kneeProfile = normalizeAthlete(
      createAthlete({
        equipment: 'full_gym',
        injuries: [
          {
            area: 'knee',
            severity: 'modify',
            notes: 'Modify flexion.',
          },
        ],
      }),
    );

    expect(
      filterEligibleExercises(seedExercises, kneeProfile, {
        includeModifiable: false,
      }).every(({ eligibility }) => eligibility.status === 'eligible'),
    ).toBe(true);
  });

  it('sorts deterministically', () => {
    const result = filterEligibleExercises(seedExercises, profile, {
      movementPattern: 'horizontal_pull',
    });

    expect(result.map(({ exercise }) => exercise.name)).toEqual([
      'Machine Row',
      'Resistance Band Row',
      'Seated Cable Row',
      'One-Arm Dumbbell Row',
    ]);
  });
});
