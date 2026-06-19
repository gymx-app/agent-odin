import { describe, expect, it } from 'vitest';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { planTrainingCalendar } from '../../../src/planning/calendar/calendar-planner.js';
import type {
  CalendarPlannerInput,
  ProgrammeStrategyV2,
} from '../../../src/planning/calendar/calendar.types.js';
import { PlannerError } from '../../../src/planning/planner-errors.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const strategy = (
  resistance_frequency: number,
  patch: Partial<
    Pick<
      ProgrammeStrategyV2,
      'split_type' | 'conditioning_frequency' | 'cycle_length_days'
    >
  > = {},
): CalendarPlannerInput['strategy'] => ({
  split_type:
    resistance_frequency <= 3
      ? 'full_body'
      : resistance_frequency === 4
        ? 'upper_lower'
        : resistance_frequency === 6
          ? 'push_pull_legs'
          : 'hybrid',
  resistance_frequency,
  conditioning_frequency: 0,
  cycle_length_days: 7,
  ...patch,
});

const plan = (
  resistanceFrequency: number,
  athletePatch: Partial<AthleteInput> = {},
  strategyPatch: Parameters<typeof strategy>[1] = {},
) =>
  planTrainingCalendar({
    profile: normalizeAthlete(
      createAthlete({
        available_days_per_week: Math.min(7, resistanceFrequency),
        ...athletePatch,
      }),
    ),
    strategy: strategy(resistanceFrequency, strategyPatch),
    cycleAnchorDate: '2026-06-22',
  });

const kinds = (result: ReturnType<typeof plan>) =>
  result.calendar.days.map((day) => day.session_kind);

describe('Calendar Planner V2', () => {
  it('spaces a deterministic two-day Full Body schedule', () => {
    const result = plan(2);

    expect(kinds(result)).toEqual([
      'full_body',
      'rest',
      'rest',
      'full_body',
      'rest',
      'rest',
      'rest',
    ]);
  });

  it('selects the three-day alternating pattern', () => {
    const result = plan(3);

    expect(kinds(result)).toEqual([
      'full_body',
      'rest',
      'full_body',
      'rest',
      'full_body',
      'rest',
      'rest',
    ]);
    expect(result.rationale_codes).toContain('THREE_DAY_ALTERNATING_SELECTED');
  });

  it('selects the four-day interleaved Upper/Lower pattern', () => {
    const result = plan(4);

    expect(kinds(result)).toEqual([
      'upper',
      'lower',
      'rest',
      'upper',
      'lower',
      'rest',
      'rest',
    ]);
    expect(result.rationale_codes).toContain('FOUR_DAY_INTERLEAVED_SELECTED');
  });

  it('selects each five-day pattern when availability forces it', () => {
    const threeOneTwo = plan(5, {
      available_days_per_week: 5,
      schedule: {
        available_days: ['MON', 'TUE', 'WED', 'FRI', 'SAT'],
        unavailable_days: ['THU', 'SUN'],
      },
    });
    const twoOneThree = plan(5, {
      available_days_per_week: 5,
      schedule: {
        available_days: ['MON', 'TUE', 'THU', 'FRI', 'SAT'],
        unavailable_days: ['WED', 'SUN'],
      },
    });

    expect(
      threeOneTwo.calendar.days.map((day) => day.planned_session_type),
    ).toEqual([
      'resistance',
      'resistance',
      'resistance',
      'rest',
      'resistance',
      'resistance',
      'rest',
    ]);
    expect(
      twoOneThree.calendar.days.map((day) => day.planned_session_type),
    ).toEqual([
      'resistance',
      'resistance',
      'rest',
      'resistance',
      'resistance',
      'resistance',
      'rest',
    ]);
  });

  it('supports weekly and rolling six-day PPL modes', () => {
    const weekly = plan(6, { fitness_level: 'intermediate' });
    expect(kinds(weekly)).toEqual([
      'push',
      'pull',
      'legs',
      'push',
      'pull',
      'legs',
      'rest',
    ]);
    expect(weekly.exceptions.map(({ code }) => code)).toContain(
      'SIX_DAY_PPL_DENSITY_ACCEPTED',
    );

    const rolling = plan(
      6,
      {
        fitness_level: 'intermediate',
        schedule: { rolling_schedule_acceptable: true },
      },
      { cycle_length_days: 8 },
    );
    expect(rolling.calendar.cycle_type).toBe('rolling');
    expect(kinds(rolling)).toEqual([
      'push',
      'pull',
      'legs',
      'rest',
      'push',
      'pull',
      'legs',
      'rest',
    ]);
  });

  it('rejects rolling schedules when the athlete has not accepted them', () => {
    expect(() =>
      plan(6, { fitness_level: 'intermediate' }, { cycle_length_days: 8 }),
    ).toThrowError(PlannerError);
  });

  it('respects explicit and preferred weekdays', () => {
    const result = plan(3, {
      available_days_per_week: 3,
      schedule: {
        available_days: ['TUE', 'THU', 'SAT'],
        preferred_days: ['THU', 'SAT'],
        unavailable_days: ['MON', 'WED', 'FRI', 'SUN'],
      },
    });

    expect(
      result.calendar.days
        .filter((day) => day.planned_session_type === 'resistance')
        .map((day) => day.day_of_week),
    ).toEqual(['TUE', 'THU', 'SAT']);
  });

  it('rejects an impossible frequency and availability combination', () => {
    expect(() =>
      plan(3, {
        available_days_per_week: 2,
        schedule: {
          available_days: ['MON', 'THU'],
          unavailable_days: ['TUE', 'WED', 'FRI', 'SAT', 'SUN'],
        },
      }),
    ).toThrow('No valid training calendar');
  });

  it('represents sport sessions and protects high-priority football', () => {
    const result = plan(3, {
      available_days_per_week: 5,
      fitness_level: 'intermediate',
      schedule: {
        available_days: ['MON', 'TUE', 'WED', 'FRI', 'SAT'],
        unavailable_days: ['THU', 'SUN'],
      },
      sport: {
        name: 'Football',
        sessions_per_week: 2,
        session_days: ['TUE', 'SAT'],
        typical_duration_min: 90,
        intensity: 'high',
        priority: 'primary',
        lower_body_load: 'high',
        upper_body_load: 'low',
        impact_level: 'high',
        sprint_exposure: true,
      },
    });

    expect(
      result.calendar.days
        .filter((day) => day.planned_session_type === 'sport')
        .map((day) => day.day_of_week),
    ).toEqual(['TUE', 'SAT']);
    expect(result.rationale_codes).toContain('SPORT_DAY_PROTECTED');
    const footballIndices = result.calendar.days
      .map((day, index) => (day.planned_session_type === 'sport' ? index : -1))
      .filter((index) => index >= 0);
    footballIndices.forEach((index) => {
      expect(result.calendar.days[index - 1]?.session_kind).not.toBe('lower');
    });
  });

  it('uses recovery state, but not age alone, in schedule density scoring', () => {
    const lowRecovery = plan(5, {
      available_days_per_week: 5,
      lifestyle: {
        sleep_hours: 5,
        sleep_quality: 3,
        perceived_stress: 9,
        recovery_rating: 3,
      },
    });
    expect(
      lowRecovery.calendar.days
        .map((day) => day.planned_session_type)
        .join(','),
    ).not.toContain('resistance,resistance,resistance');
    expect(lowRecovery.rationale_codes).toContain(
      'LOW_RECOVERY_SPACING_APPLIED',
    );

    const younger = plan(3, { age: 30 });
    const older = plan(3, { age: 65 });
    expect(older.selected_candidate_id).toBe(younger.selected_candidate_id);
  });

  it('selects identically across repeated executions', () => {
    const selections = Array.from(
      { length: 10 },
      () => plan(4).selected_candidate_id,
    );

    expect(new Set(selections).size).toBe(1);
  });
});
