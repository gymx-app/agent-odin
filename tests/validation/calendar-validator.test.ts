import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { validateLongitudinalCalendar } from '../../src/validation/calendar-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('V2 calendar validator', () => {
  it('accepts the valid longitudinal fixture calendar', () => {
    const programme = clone();
    expect(
      validateLongitudinalCalendar(
        programme.calendar,
        programme.strategy,
        createProfile(),
      ),
    ).toEqual([]);
  });

  it.each([
    [
      'duplicate cycle day',
      'DUPLICATE_CYCLE_DAY',
      (programme: ReturnType<typeof clone>) => {
        programme.calendar.days[1]!.cycle_day = 1;
      },
    ],
    [
      'frequency mismatch',
      'RESISTANCE_FREQUENCY_MISMATCH',
      (programme: ReturnType<typeof clone>) => {
        programme.strategy.resistance_frequency = 4;
      },
    ],
    [
      'sport omission',
      'SPORT_SESSION_MISSING',
      (_programme: ReturnType<typeof clone>) => {},
      createProfile({
        sport: {
          name: 'Football',
          sessions_per_week: 1,
          session_days: ['SUN'],
        },
      }),
    ],
    [
      'undocumented dense exception',
      'CALENDAR_POLICY_EXCEPTION_UNDOCUMENTED',
      (programme: ReturnType<typeof clone>) => {
        programme.strategy.resistance_frequency = 6;
        programme.calendar.days.forEach((day, index) => {
          day.planned_session_type = index < 6 ? 'resistance' : 'rest';
          day.session_kind =
            index < 6
              ? (['push', 'pull', 'legs'][index % 3] as
                  | 'push'
                  | 'pull'
                  | 'legs')
              : 'rest';
        });
      },
    ],
  ])('reports %s', (_name, code, mutate, profile = createProfile()) => {
    const programme = clone();
    mutate(programme);
    expect(
      validateLongitudinalCalendar(
        programme.calendar,
        programme.strategy,
        profile,
      ).some((finding) => finding.code === code),
    ).toBe(true);
  });

  it('reports unavailable weekday and malformed rolling calendars', () => {
    const programme = clone();
    const profile = createProfile({
      available_days_per_week: 3,
      schedule: {
        available_days: ['TUE', 'THU', 'SAT'],
        unavailable_days: ['MON', 'WED', 'FRI', 'SUN'],
      },
    });
    programme.calendar.cycle_type = 'rolling';
    programme.calendar.cycle_length_days = 7;

    const codes = validateLongitudinalCalendar(
      programme.calendar,
      programme.strategy,
      profile,
    ).map((finding) => finding.code);

    expect(codes).toContain('SESSION_ON_UNAVAILABLE_DAY');
    expect(codes).toContain('INVALID_ROLLING_SCHEDULE');
  });
});
