import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../../fixtures/programmes/valid-longitudinal-programme.js';
import { seedExercises } from '../../../src/exercises/approved-exercise-library.js';
import type { PlannedResistanceSession } from '../../../src/planning/sessions/session.types.js';
import { planSessionWarmup } from '../../../src/planning/warmup/warmup-planner.js';
import { createProfile } from '../test-planning-utils.js';

const makeSession = (): PlannedResistanceSession => {
  const day = structuredClone(
    validLongitudinalProgramme.phases[0]!.weeks[0]!.days[0]!,
  );
  return {
    day: { ...day, warmup: [] },
    week_type: 'loading',
    movement_slots: [],
    selected_exercise_ids: day.exercises.map(
      (exercise) => exercise.exercise_id,
    ),
    rationale_codes: [],
    duration: {
      estimated_duration_min: 45,
      working_time_min: 3,
      rest_time_min: 5,
      setup_transition_min: 2,
      warmup_allowance_min: 8,
      cooldown_allowance_min: 5,
    },
  };
};

describe('Warm-up Planner V2', () => {
  it('builds a session-specific beginner warm-up with linked ramp-up sets', () => {
    const result = planSessionWarmup({
      profile: createProfile({ fitness_level: 'beginner' }),
      session: makeSession(),
      exercises: seedExercises,
    });

    expect(
      result.items.some((item) => item.activity_name.includes('Squat')),
    ).toBe(true);
    expect(
      result.items.filter((item) => item.component_type === 'ramp_up_set'),
    ).toHaveLength(2);
    expect(
      result.items
        .filter((item) => item.component_type === 'ramp_up_set')
        .every((item) => item.related_exercise_id === 'dumbbell_goblet_squat'),
    ).toBe(true);
    expect(result.duration_seconds).toBeLessThanOrEqual(600);
  });

  it('compresses a short session while preserving rehearsal and ramp-up', () => {
    const result = planSessionWarmup({
      profile: createProfile({ session_duration_min: 30 }),
      session: makeSession(),
      exercises: seedExercises,
    });

    expect(result.duration_seconds).toBeLessThanOrEqual(360);
    expect(
      result.items.some((item) => item.component_type === 'movement_rehearsal'),
    ).toBe(true);
    expect(
      result.items.some((item) => item.component_type === 'ramp_up_set'),
    ).toBe(true);
  });

  it('uses three progressive ramp-ups for heavy technical lower-body work', () => {
    const session = makeSession();
    const deadlift = seedExercises.find(
      (exercise) => exercise.id === 'barbell_deadlift',
    )!;
    session.day.exercises[0] = {
      ...session.day.exercises[0]!,
      exercise_id: deadlift.id,
      exercise_name: deadlift.name,
      movement_patterns: deadlift.movement_patterns,
      equipment: deadlift.equipment,
    };
    session.day.training_budget = {
      ...session.day.training_budget!,
      intensity_intent: 'heavy',
    };
    const result = planSessionWarmup({
      profile: createProfile({ fitness_level: 'intermediate' }),
      session,
      exercises: seedExercises,
    });

    expect(result.items.map((item) => item.activity_name)).toContain(
      'Hip Hinge Rehearsal',
    );
    expect(
      result.items.filter((item) => item.component_type === 'ramp_up_set'),
    ).toHaveLength(3);
  });

  it('applies clinician-directed mobility with explicit static-stretch policy', () => {
    const result = planSessionWarmup({
      profile: createProfile({
        movement_restrictions: [
          {
            region: 'shoulder',
            movement_demand: 'overhead_loading',
            tolerance: 'modifiable',
            clinician_restriction: true,
          },
        ],
      }),
      session: makeSession(),
      exercises: seedExercises,
    });

    expect(result.rationale_codes).toContain(
      'CLINICIAN_MOBILITY_REQUIREMENT_APPLIED',
    );
    expect(result.rationale_codes).toContain('TARGETED_STATIC_STRETCH_ALLOWED');
  });

  it('omits prolonged static stretching before selected power work', () => {
    const session = makeSession();
    session.day.exercises[0]!.sequence_role = 'power';
    const result = planSessionWarmup({
      profile: createProfile({
        movement_restrictions: [
          {
            region: 'shoulder',
            movement_demand: 'overhead_loading',
            tolerance: 'modifiable',
            clinician_restriction: true,
          },
        ],
      }),
      session,
      exercises: seedExercises,
    });

    expect(result.rationale_codes).toContain(
      'STATIC_STRETCH_OMITTED_BEFORE_POWER',
    );
    expect(
      result.items.some(
        (item) =>
          item.activity_name.toLowerCase().includes('stretch') &&
          (item.duration_seconds ?? 0) > 30,
      ),
    ).toBe(false);
  });

  it('returns identical output for identical input', () => {
    const input = {
      profile: createProfile(),
      session: makeSession(),
      exercises: seedExercises,
    };
    expect(planSessionWarmup(input)).toEqual(planSessionWarmup(input));
  });
});
