import { describe, expect, it } from 'vitest';
import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import { estimateWorkoutDurationMinutes } from '../../src/planning/session-duration-estimator.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile, workoutDays } from './test-planning-utils.js';

describe('session duration estimation', () => {
  it('includes exact rest prescriptions in the duration estimate', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym', session_duration_min: 45 }),
      seedExercises,
    );
    const day = workoutDays(programme)[0]!;

    expect(estimateWorkoutDurationMinutes(day.exercises, seedExercises)).toBe(
      day.duration_min,
    );
  });

  it('removes optional accessory work before exceeding 45 minutes', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym', session_duration_min: 45 }),
      seedExercises,
    );

    expect(
      workoutDays(programme)[0]!.exercises.some((exercise) =>
        exercise.tags.includes('accessory'),
      ),
    ).toBe(false);
  });
});
