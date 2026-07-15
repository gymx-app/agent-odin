import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../../fixtures/programmes/valid-longitudinal-programme.js';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';
import { LongitudinalOdinProgrammeSchema } from '../../../src/domain/programme/programme.schema.js';
import { seedExercises } from '../../../src/exercises/approved-exercise-library.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { planTrainingCalendar } from '../../../src/planning/calendar/calendar-planner.js';
import { planProgrammePhases } from '../../../src/planning/phases/phase-planner.js';
import { buildExerciseCandidatesV2 } from '../../../src/planning/exercises/exercise-candidate-builder.js';
import {
  buildProgrammeResistanceSessions,
  buildResistanceSession,
} from '../../../src/planning/sessions/session-builder.js';
import { selectProgrammeStrategyV2 } from '../../../src/planning/strategy/strategy-selector.js';
import { planProgrammeWeeks } from '../../../src/planning/weeks/week-progression-planner.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const setup = (
  athletePatch: Partial<AthleteInput>,
  horizon: number,
  resistance: number,
) => {
  const normalized = normalizeAthlete(
    createAthlete({
      available_days_per_week: resistance,
      ...athletePatch,
    }),
  );
  const profile = { ...normalized, programme_horizon_weeks: horizon };
  const split =
    resistance <= 3
      ? 'full_body'
      : resistance === 4
        ? 'upper_lower'
        : resistance === 6
          ? 'push_pull_legs'
          : 'hybrid';
  const calendar = planTrainingCalendar({
    profile,
    strategy: {
      split_type: split,
      resistance_frequency: resistance,
      conditioning_frequency: 0,
      cycle_length_days: 7,
    },
    cycleAnchorDate: '2026-06-22',
  }).calendar;
  const strategy = selectProgrammeStrategyV2({ profile, calendar }).strategy;
  const phasePlan = planProgrammePhases({ profile, strategy, calendar });
  const weekPlan = planProgrammeWeeks({
    profile,
    strategy,
    calendar,
    phases: phasePlan.phases,
    planned_deload_weeks: phasePlan.planned_deload_weeks,
  });

  return { profile, strategy, calendar, phasePlan, weekPlan };
};

const buildFirst = (
  athletePatch: Partial<AthleteInput>,
  horizon: number,
  resistance: number,
) => {
  const context = setup(athletePatch, horizon, resistance);
  const phase = context.weekPlan.phases[0]!;
  const week = phase.weeks[0]!;
  const day = week.days.find(
    (candidate) => candidate.day_type === 'resistance',
  )!;

  return {
    ...context,
    phase,
    week,
    result: buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week,
      calendar_day: day,
      session_budget: day.training_budget!,
      exercises: seedExercises,
    }),
  };
};

describe('Session Construction V2', () => {
  it('builds a conservative exact Full Body beginner session', () => {
    const { result, profile } = buildFirst({ fitness_level: 'beginner' }, 8, 3);

    expect(result.day.title).toBe('Full Body');
    expect(result.selected_exercise_ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(result.selected_exercise_ids).size).toBe(
      result.selected_exercise_ids.length,
    );
    expect(result.day.estimated_duration_min).toBeLessThanOrEqual(
      profile.source.session_duration_min,
    );
    result.day.exercises.forEach((exercise) => {
      expect(seedExercises.some(({ id }) => id === exercise.exercise_id)).toBe(
        true,
      );
      exercise.sets.forEach((set) => {
        expect(Number.isInteger(set.target_reps)).toBe(true);
        expect(set.rpe_ceiling).toBeGreaterThanOrEqual(set.target_rpe);
        expect(Number.isInteger(set.rest_seconds)).toBe(true);
      });
    });
  });

  it('builds Upper Body push, pull and accessory coverage', () => {
    const context = setup(
      { fitness_level: 'intermediate', available_days_per_week: 4 },
      12,
      4,
    );
    const phase = context.weekPlan.phases[0]!;
    const week = phase.weeks[0]!;
    const day = week.days.find(
      (candidate) =>
        candidate.day_type === 'resistance' &&
        candidate.title.includes('Upper'),
    )!;
    const result = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week,
      calendar_day: day,
      session_budget: day.training_budget!,
      exercises: seedExercises,
    });
    const patterns = result.day.exercises.flatMap(
      (exercise) => exercise.movement_patterns,
    );

    expect(patterns).toContain('horizontal_push');
    expect(patterns).toContain('horizontal_pull');
    expect(new Set(result.selected_exercise_ids).size).toBe(
      result.selected_exercise_ids.length,
    );
  });

  it('supports posterior-chain Lower Body emphasis', () => {
    const context = setup(
      { fitness_level: 'intermediate', available_days_per_week: 4 },
      12,
      4,
    );
    const phase = context.weekPlan.phases[0]!;
    const week = phase.weeks[0]!;
    const day = week.days.find(
      (candidate) =>
        candidate.day_type === 'resistance' &&
        candidate.title.includes('Lower'),
    )!;
    day.title = 'Lower Body — Posterior Chain';
    const result = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week,
      calendar_day: day,
      session_budget: day.training_budget!,
      exercises: seedExercises,
    });

    expect(
      result.day.exercises.some((exercise) =>
        exercise.movement_patterns.includes('hinge'),
      ),
    ).toBe(true);
    expect(result.day.title).toBe('Lower Body');
  });

  it('removes excluded knee-flexion loading', () => {
    const { result } = buildFirst(
      {
        movement_restrictions: [
          {
            region: 'knee',
            movement_demand: 'loaded_deep_knee_flexion',
            tolerance: 'excluded',
          },
        ],
      },
      8,
      3,
    );

    expect(
      result.day.exercises.some((exercise) =>
        [
          'bodyweight_squat',
          'dumbbell_goblet_squat',
          'barbell_back_squat',
          'machine_leg_press',
          'dumbbell_reverse_lunge',
        ].includes(exercise.exercise_id),
      ),
    ).toBe(false);
  });

  it.each(['home_gym', 'hotel_gym'] as const)(
    'uses compatible equipment for %s',
    (equipment) => {
      const { result } = buildFirst(
        { equipment, fitness_level: 'intermediate' },
        8,
        3,
      );
      const profile = normalizeAthlete(
        createAthlete({ equipment, fitness_level: 'intermediate' }),
      );

      result.day.exercises.forEach((prescription) => {
        const exercise = seedExercises.find(
          ({ id }) => id === prescription.exercise_id,
        )!;
        expect(
          exercise.equipment.some((item) =>
            profile.equipment_capabilities.available_equipment.includes(item),
          ),
        ).toBe(true);
      });
    },
  );

  it('preserves exercise continuity across weeks and deloads', () => {
    const context = setup(
      {
        goal: 'muscle_gain',
        fitness_level: 'advanced',
        training_history: {
          years_consistent_training: 8,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
        },
      },
      20,
      5,
    );
    const phase = context.weekPlan.phases[0]!;
    const firstWeek = phase.weeks[0]!;
    const firstDay = firstWeek.days.find(
      (day) => day.day_type === 'resistance',
    )!;
    const first = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week: firstWeek,
      calendar_day: firstDay,
      session_budget: firstDay.training_budget!,
      exercises: seedExercises,
    });
    const nextWeek = phase.weeks[1]!;
    const nextDay = nextWeek.days.find(
      (day) => day.cycle_day === firstDay.cycle_day,
    )!;
    const second = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week: nextWeek,
      calendar_day: nextDay,
      session_budget: nextDay.training_budget!,
      exercises: seedExercises,
      prior_programme_context: {
        phase_id: phase.phase_id,
        by_slot_id: Object.fromEntries(
          first.movement_slots.map((slot, index) => [
            slot.slot_id,
            first.selected_exercise_ids[index]!,
          ]),
        ),
      },
    });

    expect(second.selected_exercise_ids).toEqual(first.selected_exercise_ids);
    expect(second.rationale_codes).toContain('EXERCISE_CONTINUITY_PRESERVED');
  });

  it('repairs duration by removing optional work before required work', () => {
    const context = setup(
      {
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        session_duration_min: 30,
      },
      12,
      4,
    );
    const phase = context.weekPlan.phases[0]!;
    const week = phase.weeks[0]!;
    const day = week.days.find(
      (candidate) => candidate.day_type === 'resistance',
    )!;
    day.training_budget!.total_working_set_budget = 10;
    const result = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase,
      week,
      calendar_day: day,
      session_budget: day.training_budget!,
      exercises: seedExercises,
    });

    expect(result.day.estimated_duration_min).toBeLessThanOrEqual(30);
    expect(result.rationale_codes).toContain('SESSION_DURATION_REPAIRED');
    expect(
      result.movement_slots.filter((slot) => slot.required),
    ).not.toHaveLength(0);
  });

  it('is deterministic', () => {
    const results = Array.from(
      { length: 5 },
      () => buildFirst({ fitness_level: 'intermediate' }, 12, 4).result,
    );
    results
      .slice(1)
      .forEach((result) => expect(result).toStrictEqual(results[0]));
  });

  it('produces contract-valid resistance days', () => {
    const { result } = buildFirst({ fitness_level: 'beginner' }, 8, 3);
    const programme = structuredClone(validLongitudinalProgramme);
    programme.phases[0]!.weeks[0]!.days[0] = result.day;

    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      true,
    );
  });

  it('constructs every resistance day across the V2 phase plan', () => {
    const context = setup({ fitness_level: 'beginner' }, 8, 3);
    const phases = buildProgrammeResistanceSessions({
      profile: context.profile,
      strategy: context.strategy,
      phases: context.weekPlan.phases,
      exercises: seedExercises,
    });

    phases
      .flatMap((phase) => phase.weeks)
      .flatMap((week) => week.days)
      .filter((day) => day.day_type === 'resistance')
      .forEach((day) => {
        expect(day.exercises.length).toBeGreaterThan(0);
        expect(day.warmup.length).toBeGreaterThan(0);
        const firstPriority = [...day.exercises].sort(
          (left, right) => left.priority - right.priority,
        )[0]!;
        expect(
          day.warmup.some(
            (item) =>
              item.component_type === 'ramp_up_set' &&
              item.related_exercise_id === firstPriority.exercise_id,
          ),
        ).toBe(true);
        expect(
          day.exercises.every(
            (exercise, index) =>
              exercise.display_order === index + 1 &&
              exercise.sequencing_rationale.length > 0,
          ),
        ).toBe(true);
        expect(day.session_metadata).toBeDefined();
        expect(day.session_metadata?.sequence_exceptions).toBeDefined();
        expect(day.estimated_duration_min).toBeLessThanOrEqual(
          context.profile.source.session_duration_min,
        );
      });
  });

  it('resets exercise continuity at phase boundaries', () => {
    const context = setup(
      {
        goal: 'muscle_gain',
        fitness_level: 'advanced',
        training_history: {
          years_consistent_training: 8,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
        },
      },
      20,
      5,
    );
    expect(context.weekPlan.phases.length).toBeGreaterThan(1);

    const phases = buildProgrammeResistanceSessions({
      profile: context.profile,
      strategy: context.strategy,
      phases: context.weekPlan.phases,
      exercises: seedExercises,
    });

    const firstPhase = phases[0]!;
    const secondPhase = phases[1]!;
    const resistanceDays = (
      phase: (typeof phases)[number],
    ) => phase.weeks.flatMap((week) => week.days).filter(
      (day) => day.day_type === 'resistance',
    );

    // Within the first phase, week-to-week continuity should still hold —
    // this is the existing, desired behavior, unaffected by the fix.
    const withinPhaseContinuityPreserved = resistanceDays(firstPhase)
      .slice(1)
      .some((day) =>
        day.exercises.some((exercise) =>
          exercise.sequencing_rationale.includes('EXERCISE_CONTINUITY_PRESERVED'),
        ),
      );
    expect(withinPhaseContinuityPreserved).toBe(true);

    // The first week of the next phase should never carry a forced
    // continuity bonus from the previous phase's selections — the
    // exercise pool is free to vary at the mesocycle boundary.
    const firstWeekOfSecondPhase = secondPhase.weeks[0]!.days.filter(
      (day) => day.day_type === 'resistance',
    );
    const carriesPriorPhaseContinuity = firstWeekOfSecondPhase.some((day) =>
      day.exercises.some((exercise) =>
        exercise.sequencing_rationale.includes('EXERCISE_CONTINUITY_PRESERVED'),
      ),
    );
    expect(carriesPriorPhaseContinuity).toBe(false);
  });

  it('scores a cross-programme seeded exercise with continuity, only when no within-programme prior exists', () => {
    const context = setup({ fitness_level: 'advanced', goal: 'strength' }, 12, 3);
    const firstPhase = context.weekPlan.phases[0]!;
    const firstWeekDay = firstPhase.weeks[0]!.days.find(
      (day) => day.day_type === 'resistance',
    )!;
    const baseline = buildResistanceSession({
      profile: context.profile,
      strategy: context.strategy,
      phase: firstPhase,
      week: firstPhase.weeks[0]!,
      calendar_day: firstWeekDay,
      session_budget: firstWeekDay.training_budget!,
      exercises: seedExercises,
    });
    const squatSlot = baseline.movement_slots.find(
      (slot) => slot.movement_pattern === 'squat',
    )!;
    expect(squatSlot).toBeDefined();

    const builderInput = {
      profile: context.profile,
      strategy: context.strategy,
      phase: firstPhase,
      week: firstPhase.weeks[0]!,
      calendar_day: firstWeekDay,
      session_budget: firstWeekDay.training_budget!,
      exercises: seedExercises,
    };

    const withoutSeed = buildExerciseCandidatesV2(
      builderInput,
      squatSlot,
      new Set(),
    );
    const seededCandidates = buildExerciseCandidatesV2(
      { ...builderInput, recent_exercise_ids_by_movement_pattern: { squat: 'dumbbell_goblet_squat' } },
      squatSlot,
      new Set(),
    );

    const scoreFor = (candidates: typeof withoutSeed, id: string) =>
      candidates.find((candidate) => candidate.exercise.id === id)?.score;

    expect(scoreFor(seededCandidates, 'dumbbell_goblet_squat')).toBe(
      scoreFor(withoutSeed, 'dumbbell_goblet_squat')! + 15,
    );
    expect(
      seededCandidates
        .find((candidate) => candidate.exercise.id === 'dumbbell_goblet_squat')
        ?.rationale_codes,
    ).toContain('PRIOR_PROGRAMME_EXERCISE_CONTINUED');

    // A within-programme prior (e.g. week 2, once week 1 has already run)
    // takes priority over the cross-programme seed — it should not also
    // get the cross-programme rationale code once real programme history
    // exists.
    const withWithinProgrammePrior = buildExerciseCandidatesV2(
      {
        ...builderInput,
        prior_programme_context: {
          phase_id: firstPhase.phase_id,
          by_slot_id: { [squatSlot.slot_id]: 'barbell_back_squat' },
        },
        recent_exercise_ids_by_movement_pattern: { squat: 'dumbbell_goblet_squat' },
      },
      squatSlot,
      new Set(),
    );
    const barbellCandidate = withWithinProgrammePrior.find(
      (candidate) => candidate.exercise.id === 'barbell_back_squat',
    );
    expect(barbellCandidate?.rationale_codes).toContain(
      'EXERCISE_CONTINUITY_PRESERVED',
    );
    const goblet = withWithinProgrammePrior.find(
      (candidate) => candidate.exercise.id === 'dumbbell_goblet_squat',
    );
    expect(goblet?.rationale_codes).not.toContain(
      'PRIOR_PROGRAMME_EXERCISE_CONTINUED',
    );
  });

  it('only seeds continuity from a prior programme for the very first week', () => {
    const context = setup({ fitness_level: 'advanced', goal: 'strength' }, 12, 3);

    const phases = buildProgrammeResistanceSessions({
      profile: context.profile,
      strategy: context.strategy,
      phases: context.weekPlan.phases,
      exercises: seedExercises,
      recent_exercise_ids_by_movement_pattern: {
        squat: 'dumbbell_goblet_squat',
      },
    });

    const week2Day = phases[0]!.weeks[1]!.days.find(
      (day) => day.day_type === 'resistance',
    )!;
    const week2CarriesSeedRationale = week2Day.exercises.some((exercise) =>
      exercise.sequencing_rationale.includes('PRIOR_PROGRAMME_EXERCISE_CONTINUED'),
    );
    expect(week2CarriesSeedRationale).toBe(false);
  });
});
