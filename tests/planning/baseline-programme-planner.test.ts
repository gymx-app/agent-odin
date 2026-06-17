import { describe, expect, it } from 'vitest';
import { OdinProgrammeSchema } from '../../src/domain/programme/programme.schema.js';
import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import { PlannerError } from '../../src/planning/planner-errors.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile, lissDays, workoutDays } from './test-planning-utils.js';

const allExerciseIds = new Set(seedExercises.map((exercise) => exercise.id));

describe('buildBaselineProgramme', () => {
  it('builds a valid deterministic baseline programme', () => {
    const profile = createProfile({
      equipment: 'full_gym',
      available_days_per_week: 3,
    });
    const first = buildBaselineProgramme(profile, seedExercises);
    const second = buildBaselineProgramme(profile, seedExercises);

    expect(first).toStrictEqual(second);
    expect(OdinProgrammeSchema.safeParse(first).success).toBe(true);
    expect(first.phase_week_templates[0]!.days).toHaveLength(7);
    expect(first.phases).toHaveLength(1);
    expect(first.phases[0]!.name).toBe('Foundation');
  });

  it('uses approved exercise IDs only', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym' }),
      seedExercises,
    );

    workoutDays(programme).forEach((day) => {
      day.exercises.forEach((exercise) => {
        expect(allExerciseIds.has(exercise.exercise_id)).toBe(true);
      });
    });
  });

  it('includes exact set-level prescriptions', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym' }),
      seedExercises,
    );
    const exercise = workoutDays(programme)[0]!.exercises[0]!;

    expect(exercise.sets.length).toBeGreaterThan(0);
    expect(exercise.sets[0]).toEqual(
      expect.objectContaining({
        target_reps: expect.any(Number),
        target_rpe: expect.any(Number),
        rpe_ceiling: expect.any(Number),
        rest_seconds: expect.any(Number),
      }),
    );
    expect(exercise.progression_bounds).toEqual(
      expect.objectContaining({
        rep_min: expect.any(Number),
        rep_max: expect.any(Number),
      }),
    );
  });

  it('does not prescribe specific weights', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym' }),
      seedExercises,
    );

    expect(JSON.stringify(programme).toLowerCase()).not.toContain('kg load');
  });

  it('marks the first set as calibration', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym' }),
      seedExercises,
    );

    expect(workoutDays(programme)[0]!.exercises[0]!.sets[0]!.set_type).toBe(
      'calibration',
    );
  });

  it('adds a review trigger when horizon exceeds 8 weeks', () => {
    const profile = {
      ...createProfile({ equipment: 'full_gym' }),
      programme_horizon_weeks: 20,
    };

    expect(
      buildBaselineProgramme(profile, seedExercises).review_triggers,
    ).toContain(
      'Generate the next block after reviewing performance, recovery and restrictions.',
    );
  });

  it('fits final workout durations to the session limit', () => {
    const programme = buildBaselineProgramme(
      createProfile({
        equipment: 'full_gym',
        available_days_per_week: 3,
        session_duration_min: 45,
      }),
      seedExercises,
    );

    workoutDays(programme).forEach((day) => {
      expect(day.duration_min).toBeLessThanOrEqual(45);
    });
  });

  it('supports fat loss with resistance and LISS', () => {
    const programme = buildBaselineProgramme(
      createProfile({
        equipment: 'full_gym',
        available_days_per_week: 5,
        goal: 'fat_loss',
      }),
      seedExercises,
    );

    expect(workoutDays(programme)).toHaveLength(4);
    expect(lissDays(programme)).toHaveLength(1);
  });

  it('supports endurance with resistance plus LISS', () => {
    const programme = buildBaselineProgramme(
      createProfile({
        equipment: 'full_gym',
        available_days_per_week: 5,
        goal: 'endurance',
      }),
      seedExercises,
    );

    expect(workoutDays(programme).length).toBeGreaterThanOrEqual(2);
    expect(lissDays(programme).length).toBeGreaterThanOrEqual(1);
  });

  it('uses concise programme and workout labels', () => {
    const programme = buildBaselineProgramme(
      createProfile({ equipment: 'full_gym', goal: 'strength' }),
      seedExercises,
    );

    expect(programme.programme.name).toBe('Strength Base');
    expect(
      programme.phase_week_templates[0]!.days.some((day) =>
        day.title.includes('A'),
      ),
    ).toBe(false);
  });

  it('fails for invalid exercise libraries', () => {
    expect(() =>
      buildBaselineProgramme(createProfile(), [
        {
          ...seedExercises[0]!,
          id: seedExercises[1]!.id,
        },
        seedExercises[1]!,
      ]),
    ).toThrow(PlannerError);
  });

  it('fails when required hinge slot cannot be filled', () => {
    const noHinge = seedExercises.filter(
      (exercise) => !exercise.movement_patterns.includes('hinge'),
    );

    expect(() =>
      buildBaselineProgramme(createProfile({ equipment: 'full_gym' }), noHinge),
    ).toThrow(PlannerError);
  });
});
