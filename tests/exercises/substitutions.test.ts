import { describe, expect, it } from 'vitest';
import { findExerciseSubstitutions } from '../../src/exercises/substitutions.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from '../normalization/test-athletes.js';
import { findSeedExercise } from './test-exercise-utils.js';

describe('findExerciseSubstitutions', () => {
  it('prefers the same substitution group', () => {
    const profile = normalizeAthlete(
      createAthlete({
        equipment: 'full_gym',
      }),
    );

    expect(
      findExerciseSubstitutions(
        findSeedExercise('dumbbell_biceps_curl'),
        seedExercises,
        profile,
      )[0]?.exercise.id,
    ).toBe('band_biceps_curl');
  });

  it('removes ineligible substitutions', () => {
    const profile = normalizeAthlete(
      createAthlete({
        equipment: 'full_gym',
        injuries: [
          {
            area: 'knee',
            severity: 'avoid',
            notes: 'Avoid knee loading.',
          },
        ],
      }),
    );

    expect(
      findExerciseSubstitutions(
        findSeedExercise('dumbbell_goblet_squat'),
        seedExercises,
        profile,
      ).some(({ exercise }) => exercise.id === 'barbell_back_squat'),
    ).toBe(false);
  });

  it('removes the source exercise', () => {
    const profile = normalizeAthlete(createAthlete({ equipment: 'full_gym' }));

    expect(
      findExerciseSubstitutions(
        findSeedExercise('dumbbell_biceps_curl'),
        seedExercises,
        profile,
      ).some(({ exercise }) => exercise.id === 'dumbbell_biceps_curl'),
    ).toBe(false);
  });

  it('returns deterministic ranking', () => {
    const profile = normalizeAthlete(createAthlete({ equipment: 'full_gym' }));

    expect(
      findExerciseSubstitutions(
        findSeedExercise('dumbbell_biceps_curl'),
        seedExercises,
        profile,
      ).map(({ exercise }) => exercise.id),
    ).toEqual(['band_biceps_curl', 'cable_biceps_curl']);
  });

  it('returns empty results when no substitution is available', () => {
    const profile = normalizeAthlete(
      createAthlete({ equipment: 'bodyweight' }),
    );

    expect(
      findExerciseSubstitutions(
        findSeedExercise('lat_pulldown'),
        seedExercises,
        profile,
      ),
    ).toEqual([]);
  });
});
