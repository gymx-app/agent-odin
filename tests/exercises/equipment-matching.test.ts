import { describe, expect, it } from 'vitest';
import { matchExerciseEquipment } from '../../src/exercises/equipment-matching.js';
import { findSeedExercise } from './test-exercise-utils.js';

describe('matchExerciseEquipment', () => {
  it('allows full gym equipment', () => {
    expect(
      matchExerciseEquipment(findSeedExercise('barbell_back_squat'), 'full_gym')
        .compatible,
    ).toBe(true);
  });

  it('allows dumbbells-only equipment', () => {
    expect(
      matchExerciseEquipment(
        findSeedExercise('dumbbell_bench_press'),
        'dumbbells_only',
      ).compatible,
    ).toBe(true);
  });

  it('keeps bodyweight conservative', () => {
    expect(
      matchExerciseEquipment(findSeedExercise('pull_up'), 'bodyweight')
        .compatible,
    ).toBe(false);
  });

  it('uses conservative home gym equipment', () => {
    expect(
      matchExerciseEquipment(
        findSeedExercise('resistance_band_row'),
        'home_gym',
      ).compatible,
    ).toBe(true);
  });

  it('returns mismatch reasons for unavailable required equipment', () => {
    const result = matchExerciseEquipment(
      findSeedExercise('lat_pulldown'),
      'dumbbells_only',
    );

    expect(result.compatible).toBe(false);
    expect(result.missing_equipment).toEqual(['cable']);
    expect(result.reasons[0]).toContain('cable');
  });
});
