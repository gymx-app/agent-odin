import { describe, expect, it } from 'vitest';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { planTrainingCalendar } from '../../../src/planning/calendar/calendar-planner.js';
import { selectProgrammeStrategyV2 } from '../../../src/planning/strategy/strategy-selector.js';
import type { ProgrammeStrategyV2 } from '../../../src/planning/calendar/calendar.types.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const select = (
  athletePatch: Partial<AthleteInput> = {},
  options: {
    horizon?: number;
    resistance?: number;
    conditioning?: number;
    split?: ProgrammeStrategyV2['split_type'];
    cycle?: number;
  } = {},
) => {
  const profile = normalizeAthlete(createAthlete(athletePatch));
  const horizonProfile = {
    ...profile,
    programme_horizon_weeks: options.horizon ?? profile.programme_horizon_weeks,
  };
  const resistance =
    options.resistance ?? horizonProfile.source.available_days_per_week;
  const split =
    options.split ??
    (resistance <= 3
      ? 'full_body'
      : resistance === 4
        ? 'upper_lower'
        : resistance === 6
          ? 'push_pull_legs'
          : 'hybrid');
  const calendar = planTrainingCalendar({
    profile: horizonProfile,
    strategy: {
      split_type: split,
      resistance_frequency: resistance,
      conditioning_frequency: options.conditioning ?? 0,
      cycle_length_days: options.cycle ?? 7,
    },
    cycleAnchorDate: '2026-06-22',
  }).calendar;

  return {
    profile: horizonProfile,
    calendar,
    result: selectProgrammeStrategyV2({
      profile: horizonProfile,
      calendar,
    }),
  };
};

describe('Strategy Selector V2', () => {
  it('selects simple Full Body progression for a beginner', () => {
    const { result } = select(
      {
        fitness_level: 'beginner',
        available_days_per_week: 3,
      },
      { horizon: 10, resistance: 3 },
    );

    expect(result.strategy).toMatchObject({
      periodization_model: 'simple_progressive',
      progression_model: 'linear_reps',
      split_type: 'full_body',
      volume_strategy: 'conservative',
    });
  });

  it('keeps beginner strength simple without an undated peak', () => {
    const { result } = select(
      {
        goal: 'strength',
        fitness_level: 'beginner',
        available_days_per_week: 3,
      },
      { horizon: 8, resistance: 3 },
    );

    expect(result.strategy.periodization_model).toBe('simple_progressive');
    expect(result.strategy.progression_model).not.toBe('wave_loading');
    expect(result.strategy.periodization_model).not.toBe('competition_peak');
  });

  it('selects load-primary progression for an intermediate strength goal without a competition date', () => {
    // Short horizon (<=6wk) constraint-rejects block/undulating/
    // competition_peak (PERIODIZATION_EXCESSIVE_FOR_HORIZON), isolating the
    // choice to simple_progressive/concurrent/maintenance so the
    // goal-driven progression_model pick is unambiguous.
    const { result } = select(
      {
        goal: 'strength',
        fitness_level: 'intermediate',
        available_days_per_week: 4,
      },
      { horizon: 6, resistance: 4 },
    );

    expect(result.strategy.progression_model).toBe('linear_load');
    expect(
      result.strategy.rationale.some(
        (decision) => decision.code === 'SCHOENFELD_2021_LOAD_HYPERTROPHY',
      ),
    ).toBe(true);
  });

  it('does not select a load-primary progression model for an intermediate hypertrophy goal', () => {
    const { result } = select(
      {
        goal: 'muscle_gain',
        fitness_level: 'intermediate',
        available_days_per_week: 4,
      },
      { horizon: 6, resistance: 4 },
    );

    expect(result.strategy.progression_model).not.toBe('linear_load');
    expect(
      ['linear_load', 'wave_loading', 'step_loading', 'performance_based'],
    ).not.toContain(result.strategy.progression_model);
  });

  it('constrains volume for intermediate fat loss in a deficit', () => {
    const { result } = select(
      {
        goal: 'fat_loss',
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        nutrition: { calorie_status: 'deficit' },
      },
      { horizon: 12, resistance: 3, conditioning: 1 },
    );

    expect(['concurrent', 'simple_progressive']).toContain(
      result.strategy.periodization_model,
    );
    expect(result.strategy.volume_strategy).toBe('conservative');
    expect(result.rationale.map(({ code }) => code)).toContain(
      'CALORIC_DEFICIT_VOLUME_CONSTRAINED',
    );
  });

  it('selects development complexity for intermediate hypertrophy', () => {
    const { result } = select(
      {
        goal: 'muscle_gain',
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        training_history: {
          consistency_last_12_weeks: 'high',
          exercise_competency: 'competent',
        },
      },
      { horizon: 12, resistance: 4 },
    );

    expect(['double_progression', 'step_loading']).toContain(
      result.strategy.progression_model,
    );
    expect(result.strategy.volume_strategy).toBe('moderate');
  });

  it('supports advanced hypertrophy complexity and fatigue management', () => {
    const { result } = select(
      {
        goal: 'muscle_gain',
        fitness_level: 'advanced',
        available_days_per_week: 5,
        training_history: {
          years_consistent_training: 8,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
          previous_programme_response: 'good',
        },
        lifestyle: {
          sleep_hours: 8,
          sleep_quality: 9,
          perceived_stress: 3,
          recovery_rating: 9,
        },
      },
      { horizon: 20, resistance: 5 },
    );

    expect(['block', 'undulating']).toContain(
      result.strategy.periodization_model,
    );
    expect(['step_loading', 'wave_loading']).toContain(
      result.strategy.progression_model,
    );
    expect(['planned_deload', 'combined']).toContain(
      result.strategy.fatigue_strategy,
    );
  });

  it('selects a competition peak only with a dated strength target', () => {
    const { result } = select(
      {
        goal: 'strength',
        fitness_level: 'advanced',
        available_days_per_week: 4,
        sport: {
          name: 'Powerlifting',
          sessions_per_week: 1,
          session_days: ['SUN'],
          typical_duration_min: 120,
          intensity: 'high',
          priority: 'equal',
          competition_date: '2026-10-18',
        },
      },
      { horizon: 16, resistance: 4 },
    );

    expect(result.strategy.periodization_model).toBe('competition_peak');
    expect(result.rationale.map(({ code }) => code)).toContain(
      'COMPETITION_PEAK_SELECTED',
    );
  });

  it('uses sport support without redundant conditioning', () => {
    const { result } = select(
      {
        goal: 'strength',
        fitness_level: 'intermediate',
        available_days_per_week: 4,
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
      { horizon: 12, resistance: 3 },
    );

    expect(result.strategy.primary_objective).toBe('sport_support');
    expect(result.strategy.conditioning_strategy).toBe('sport_support');
    expect(result.strategy.conditioning_frequency).toBe(0);
  });

  it('reduces complexity for low recovery and rejects dense PPL', () => {
    expect(() =>
      select(
        {
          fitness_level: 'intermediate',
          available_days_per_week: 6,
          lifestyle: {
            sleep_hours: 5,
            sleep_quality: 3,
            perceived_stress: 9,
            recovery_rating: 2,
          },
        },
        { horizon: 12, resistance: 6, split: 'push_pull_legs' },
      ),
    ).toThrow();

    const { result } = select(
      {
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        lifestyle: {
          sleep_hours: 5,
          sleep_quality: 3,
          perceived_stress: 9,
          recovery_rating: 2,
        },
      },
      { horizon: 12, resistance: 4 },
    );
    expect(result.strategy.volume_strategy).toBe('conservative');
    expect(result.strategy.periodization_model).toBe('simple_progressive');
  });

  it('does not use diet pattern or origin as strategy shortcuts', () => {
    const base = select(
      { fitness_level: 'intermediate', available_days_per_week: 4 },
      { horizon: 12, resistance: 4 },
    ).result;
    const vegan = select(
      {
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        nutrition: {
          diet_pattern: 'vegan',
          estimated_protein_g_per_day: 140,
          protein_adequacy_confidence: 'high',
        },
      },
      { horizon: 12, resistance: 4 },
    ).result;
    const southAsian = select(
      {
        fitness_level: 'intermediate',
        available_days_per_week: 4,
        origin_metadata: { country: 'India', ethnicity: 'South Asian' },
      },
      { horizon: 12, resistance: 4 },
    ).result;

    expect(vegan.strategy).toStrictEqual(base.strategy);
    expect(southAsian.strategy).toStrictEqual(base.strategy);
  });

  it('is deterministic', () => {
    const selections = Array.from(
      { length: 10 },
      () =>
        select(
          { fitness_level: 'intermediate', available_days_per_week: 4 },
          { horizon: 12, resistance: 4 },
        ).result.selected_candidate_id,
    );
    expect(new Set(selections).size).toBe(1);
  });
});
