import { describe, expect, it } from 'vitest';
import { evaluateExerciseEligibility } from '../../src/exercises/eligibility.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from '../normalization/test-athletes.js';
import {
  createExercisePatch,
  findSeedExercise,
} from './test-exercise-utils.js';

describe('evaluateExerciseEligibility', () => {
  it('marks unrestricted exercise eligible', () => {
    const profile = normalizeAthlete(createAthlete({ injuries: [] }));

    expect(
      evaluateExerciseEligibility(findSeedExercise('dead_bug'), profile).status,
    ).toBe('eligible');
  });

  it('returns modifiable for modify conflicts', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'knee',
            severity: 'modify',
            notes: 'Modify depth.',
          },
        ],
      }),
    );

    expect(
      evaluateExerciseEligibility(
        findSeedExercise('dumbbell_goblet_squat'),
        profile,
      ).status,
    ).toBe('modifiable');
  });

  it('returns excluded for avoid conflicts', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'knee',
            severity: 'avoid',
            notes: 'Avoid depth.',
          },
        ],
      }),
    );

    expect(
      evaluateExerciseEligibility(
        findSeedExercise('dumbbell_goblet_squat'),
        profile,
      ).status,
    ).toBe('excluded');
  });

  it('excludes explicitly excluded exercise IDs', () => {
    const profile = {
      ...normalizeAthlete(createAthlete()),
      excluded_exercise_ids: ['dead_bug'],
    };

    expect(
      evaluateExerciseEligibility(findSeedExercise('dead_bug'), profile).status,
    ).toBe('excluded');
  });

  it('excludes deprecated exercises', () => {
    const profile = normalizeAthlete(createAthlete());

    expect(
      evaluateExerciseEligibility(
        createExercisePatch({ status: 'deprecated' }),
        profile,
      ).status,
    ).toBe('excluded');
  });

  it('marks experimental exercises modifiable with a warning', () => {
    const profile = normalizeAthlete(createAthlete());
    const result = evaluateExerciseEligibility(
      createExercisePatch({ status: 'experimental' }),
      profile,
    );

    expect(result.status).toBe('modifiable');
    expect(result.warnings[0]).toContain('experimental');
  });

  it('excludes fixed-supinated-grip exercises for an avoid-severity wrist injury', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'wrist',
            severity: 'avoid',
            notes: 'TFCC tear, avoid supinated grip loading.',
          },
        ],
      }),
    );

    for (const exerciseId of [
      'barbell_biceps_curl',
      'dumbbell_biceps_curl',
      'underhand_lat_pulldown',
      'chin_up',
      'barbell_preacher_curl',
    ]) {
      expect(
        evaluateExerciseEligibility(findSeedExercise(exerciseId), profile)
          .status,
      ).toBe('excluded');
    }
  });

  it('does not conflict when movement demand score is zero', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'knee',
            severity: 'avoid',
            notes: 'Avoid loaded knee flexion.',
          },
        ],
      }),
    );

    expect(
      evaluateExerciseEligibility(findSeedExercise('dead_bug'), profile)
        .conflicts,
    ).toEqual([]);
  });
});
