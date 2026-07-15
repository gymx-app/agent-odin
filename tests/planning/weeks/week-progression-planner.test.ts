import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../../fixtures/programmes/valid-longitudinal-programme.js';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';
import { LongitudinalOdinProgrammeSchema } from '../../../src/domain/programme/programme.schema.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { planTrainingCalendar } from '../../../src/planning/calendar/calendar-planner.js';
import { planProgrammePhases } from '../../../src/planning/phases/phase-planner.js';
import { selectProgrammeStrategyV2 } from '../../../src/planning/strategy/strategy-selector.js';
import { planProgrammeWeeks } from '../../../src/planning/weeks/week-progression-planner.js';
import { estimateMaximumSessionSets } from '../../../src/planning/weeks/week-policies.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const plan = (
  athletePatch: Partial<AthleteInput>,
  horizon: number,
  resistance: number,
  conditioning = 0,
) => {
  const normalized = normalizeAthlete(
    createAthlete({
      available_days_per_week: resistance + conditioning,
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
      conditioning_frequency: conditioning,
      cycle_length_days: 7,
    },
    cycleAnchorDate: '2026-06-22',
  }).calendar;
  const strategy = selectProgrammeStrategyV2({ profile, calendar }).strategy;
  const phasePlan = planProgrammePhases({ profile, strategy, calendar });
  return {
    profile,
    strategy,
    calendar,
    phasePlan,
    result: planProgrammeWeeks({
      profile,
      strategy,
      calendar,
      phases: phasePlan.phases,
      planned_deload_weeks: phasePlan.planned_deload_weeks,
    }),
  };
};

describe('Week Progression Planner V2', () => {
  it('creates conservative deterministic beginner weeks without overload', () => {
    const { result } = plan({ fitness_level: 'beginner' }, 12, 3);

    expect(result.weeks).toHaveLength(12);
    expect(result.weeks[0]?.week_type).toBe('introduction');
    expect(result.weeks.some(({ week_type }) => week_type === 'overload')).toBe(
      false,
    );
    expect(result.weeks[0]?.planned_volume_factor).toBeLessThan(1);
    expect(result.progression_plan.default_policy.model).toBe('linear_reps');
  });

  it('reduces introduction load after detraining', () => {
    const { result } = plan(
      {
        fitness_level: 'intermediate',
        training_history: {
          detraining_weeks: 12,
          years_consistent_training: 3,
          exercise_competency: 'competent',
        },
      },
      10,
      3,
    );

    expect(result.weeks[0]).toMatchObject({
      week_type: 'introduction',
      planned_volume_factor: 0.7,
      planned_intensity_factor: 0.85,
      planned_effort_factor: 0.8,
    });
  });

  it('constrains deficit volume and failure exposure', () => {
    const { result } = plan(
      {
        goal: 'fat_loss',
        fitness_level: 'intermediate',
        nutrition: { calorie_status: 'deficit' },
      },
      12,
      3,
      1,
    );

    result.weeks.forEach((week) => {
      expect(week.planned_volume_factor).toBeLessThanOrEqual(1);
      expect(
        week.planning_metadata.intensity_target.failure_exposure_policy,
      ).toBe('none');
    });
  });

  it('uses hypertrophy emphasis and limits simultaneous progression', () => {
    const { result } = plan(
      {
        goal: 'muscle_gain',
        fitness_level: 'intermediate',
        training_history: {
          years_consistent_training: 3,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'competent',
        },
      },
      12,
      4,
    );

    expect(['double_progression', 'step_loading']).toContain(
      result.progression_plan.default_policy.model,
    );
    expect(
      result.weeks[1]?.planning_metadata.intensity_target.rep_emphasis,
    ).toBe('hypertrophy');
    result.weeks.slice(1).forEach((week, index) => {
      const previous = result.weeks[index]!;
      if (previous.week_type === 'deload') return;
      const increases = [
        week.planned_volume_factor - previous.planned_volume_factor,
        week.planned_intensity_factor - previous.planned_intensity_factor,
        week.planned_effort_factor - previous.planned_effort_factor,
      ].filter((increase) => increase > 0.05);
      expect(increases.length).toBeLessThanOrEqual(1);
    });
  });

  it('creates advanced strength intensity progression and justified testing', () => {
    const { result } = plan(
      {
        goal: 'strength',
        fitness_level: 'advanced',
        training_history: {
          years_consistent_training: 8,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
        },
        sport: {
          name: 'Powerlifting',
          sessions_per_week: 1,
          session_days: ['SUN'],
          intensity: 'high',
          priority: 'equal',
          competition_date: '2026-10-18',
        },
      },
      16,
      4,
    );

    expect(['wave_loading', 'performance_based']).toContain(
      result.progression_plan.default_policy.model,
    );
    expect(result.weeks.at(-1)?.week_type).toBe('testing');
    expect(result.weeks.at(-1)?.planned_intensity_factor).toBeGreaterThan(1);
  });

  it('reduces lower-body fatigue around repeated football', () => {
    const { result } = plan(
      {
        fitness_level: 'intermediate',
        sport: {
          name: 'Football',
          sessions_per_week: 2,
          session_days: ['TUE', 'SAT'],
          intensity: 'high',
          priority: 'primary',
          lower_body_load: 'high',
          impact_level: 'high',
          sprint_exposure: true,
        },
      },
      12,
      3,
    );

    result.weeks.forEach((week) => {
      expect(week.planning_metadata.fatigue_budget.lower_body_target).toBe(
        'low',
      );
    });
  });

  it('assigns zero squat volume for excluded loaded knee flexion', () => {
    const { result } = plan(
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
    const squat =
      result.weeks[0]?.planning_metadata.movement_pattern_budgets.find(
        ({ movement_pattern }) => movement_pattern === 'squat',
      );

    expect(squat?.set_target).toBe(0);
    expect(squat?.rationale_codes).toContain(
      'MOVEMENT_RESTRICTION_REALLOCATION',
    );
  });

  it('caps session sets to fit a short session', () => {
    const { result } = plan({ session_duration_min: 20 }, 8, 3);
    const maximum = estimateMaximumSessionSets(20);

    result.weeks
      .flatMap(({ days }) => days)
      .forEach((day) => {
        if (day.training_budget) {
          expect(
            day.training_budget.total_working_set_budget,
          ).toBeLessThanOrEqual(maximum);
          expect(
            day.training_budget.estimated_duration_min,
          ).toBeLessThanOrEqual(20);
        }
      });
  });

  it('constructs explicit deload adjustments', () => {
    const { result, phasePlan } = plan(
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
    const deloads = result.weeks.filter(
      ({ week_type }) => week_type === 'deload',
    );

    expect(deloads.map(({ week_number }) => week_number)).toEqual(
      phasePlan.planned_deload_weeks,
    );
    deloads.forEach((week) => {
      expect(week.planning_metadata.deload_adjustments).toBeDefined();
      expect(week.planned_volume_factor).toBeLessThanOrEqual(0.75);
      expect(week.planned_effort_factor).toBeLessThanOrEqual(0.9);
    });
  });

  it('anchors known recent volume and marks unknown volume conservatively', () => {
    const known = plan(
      {
        training_history: {
          recent_weekly_sets_by_muscle: { quadriceps: 8 },
        },
      },
      8,
      3,
    ).result;
    const unknown = plan({}, 8, 3).result;

    expect(known.weeks[0]?.planning_metadata.rationale_codes).toContain(
      'RECENT_VOLUME_ANCHORED',
    );
    expect(unknown.weeks[0]?.planning_metadata.rationale_codes).toContain(
      'RECENT_VOLUME_UNKNOWN_CONSERVATIVE_START',
    );
  });

  it('rotates heavy/moderate/light intensity across resistance days when periodization_model is undulating', () => {
    const { profile, strategy, calendar, phasePlan } = plan(
      { fitness_level: 'advanced', goal: 'muscle_gain' },
      8,
      3,
    );
    const undulatingStrategy = { ...strategy, periodization_model: 'undulating' as const };
    const result = planProgrammeWeeks({
      profile,
      strategy: undulatingStrategy,
      calendar,
      phases: phasePlan.phases,
      planned_deload_weeks: phasePlan.planned_deload_weeks,
    });

    const resistanceDays = result.weeks[0]!.days.filter(
      (day) => day.day_type === 'resistance',
    );
    expect(resistanceDays.length).toBeGreaterThanOrEqual(3);
    const rpes = resistanceDays.map((day) => day.training_budget!.effort_target);
    // Heavy/moderate/light should not all collapse to the same RPE.
    expect(new Set(rpes).size).toBeGreaterThan(1);
    expect(rpes[0]).toBeGreaterThan(rpes[2]!);
  });

  it('keeps a flat weekly intensity target for non-undulating periodization models', () => {
    const { result } = plan(
      { fitness_level: 'advanced', goal: 'strength' },
      8,
      3,
    );
    const resistanceDays = result.weeks[0]!.days.filter(
      (day) => day.day_type === 'resistance',
    );
    const rpes = resistanceDays.map((day) => day.training_budget!.effort_target);
    expect(new Set(rpes).size).toBe(1);
  });

  it('is deterministic', () => {
    const results = Array.from(
      { length: 5 },
      () => plan({ fitness_level: 'intermediate' }, 12, 4).result,
    );
    results
      .slice(1)
      .forEach((result) => expect(result).toStrictEqual(results[0]));
  });

  it('produces contract-valid explicit V2 phases and weeks', () => {
    const planned = plan({ fitness_level: 'beginner' }, 8, 3);
    const programme = {
      ...validLongitudinalProgramme,
      programme: {
        ...validLongitudinalProgramme.programme,
        target_weeks: 8,
      },
      strategy: planned.strategy,
      calendar: planned.calendar,
      phases: planned.result.phases,
      fatigue_management_policy: planned.phasePlan.fatigue_management_policy,
    };

    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      true,
    );
  });
});
