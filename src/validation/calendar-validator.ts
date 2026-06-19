import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

type Calendar = LongitudinalOdinProgramme['calendar'];
type Strategy = LongitudinalOdinProgramme['strategy'];
type CalendarDay = Calendar['days'][number];

const count = (
  calendar: Calendar,
  type: CalendarDay['planned_session_type'],
): number =>
  calendar.days.filter((day) => day.planned_session_type === type).length;

const maximumConsecutive = (
  days: CalendarDay[],
  predicate: (day: CalendarDay) => boolean,
): number => {
  let maximum = 0;
  let current = 0;
  days.forEach((day) => {
    current = predicate(day) ? current + 1 : 0;
    maximum = Math.max(maximum, current);
  });
  return maximum;
};

const level = { none: 0, low: 1, moderate: 2, high: 3 };

export const validateLongitudinalCalendar = (
  calendar: Calendar,
  strategy: Strategy,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const expectedLength = calendar.cycle_type === 'weekly' ? 7 : 8;
  const cycleDays = calendar.days.map((day) => day.cycle_day);
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    category: 'structure' | 'constraint_fit' | 'recovery_fit',
    message: string,
    metadata: Record<string, unknown> = {},
  ) =>
    findings.push(
      finding(validationCodes[code], severity, category, message, { metadata }),
    );

  if (
    calendar.cycle_length_days !== expectedLength ||
    calendar.days.length !== expectedLength
  ) {
    add(
      'INVALID_CALENDAR_CYCLE_LENGTH',
      'error',
      'structure',
      'Calendar length does not match its declared cycle type.',
      { cycle_days: cycleDays },
    );
  }
  if (new Set(cycleDays).size !== cycleDays.length) {
    add(
      'DUPLICATE_CYCLE_DAY',
      'error',
      'structure',
      'Calendar contains duplicate cycle days.',
      { cycle_days: cycleDays },
    );
  }
  if (cycleDays.some((day, index) => day !== index + 1)) {
    add(
      'NON_CONSECUTIVE_CYCLE_DAY',
      'error',
      'structure',
      'Calendar cycle days must be consecutive.',
      { cycle_days: cycleDays },
    );
  }
  if (
    calendar.cycle_type === 'rolling' &&
    (!profile.source.schedule?.rolling_schedule_acceptable ||
      strategy.cycle_length_days !== 8)
  ) {
    add(
      'INVALID_ROLLING_SCHEDULE',
      'error',
      'constraint_fit',
      'Rolling calendar is not accepted by both athlete and strategy.',
    );
  }
  const unavailable = new Set(profile.source.schedule?.unavailable_days ?? []);
  const unavailableDays = calendar.days.filter(
    (day) =>
      day.day_of_week &&
      unavailable.has(day.day_of_week) &&
      day.planned_session_type !== 'rest',
  );
  if (unavailableDays.length > 0) {
    add(
      'SESSION_ON_UNAVAILABLE_DAY',
      'error',
      'constraint_fit',
      'Calendar schedules training on an unavailable weekday.',
      { cycle_days: unavailableDays.map((day) => day.cycle_day) },
    );
  }
  if (count(calendar, 'resistance') !== strategy.resistance_frequency) {
    add(
      'RESISTANCE_FREQUENCY_MISMATCH',
      'error',
      'constraint_fit',
      'Calendar resistance frequency does not match strategy.',
    );
  }
  if (count(calendar, 'conditioning') !== strategy.conditioning_frequency) {
    add(
      'CONDITIONING_FREQUENCY_MISMATCH',
      'error',
      'constraint_fit',
      'Calendar conditioning frequency does not match strategy.',
    );
  }
  const expectedSport = profile.source.sport?.sessions_per_week ?? 0;
  if (
    calendar.cycle_type === 'weekly' &&
    count(calendar, 'sport') !== expectedSport
  ) {
    add(
      'SPORT_SESSION_MISSING',
      'error',
      'constraint_fit',
      'Calendar does not represent every reported sport session.',
    );
  }
  if (profile.source.sport?.session_days) {
    const scheduledSportDays = new Set(
      calendar.days
        .filter((day) => day.planned_session_type === 'sport')
        .map((day) => day.day_of_week),
    );
    if (
      profile.source.sport.session_days.some(
        (day) => !scheduledSportDays.has(day),
      )
    ) {
      add(
        'SPORT_SCHEDULE_CONFLICT',
        'error',
        'constraint_fit',
        'Calendar sport sessions do not match reported sport weekdays.',
      );
    }
  }
  const consecutiveResistance = maximumConsecutive(
    calendar.days,
    (day) => day.planned_session_type === 'resistance',
  );
  if (consecutiveResistance >= 4) {
    const documented = calendar.exceptions?.some(
      (exception) => exception.code === 'SIX_DAY_PPL_DENSITY_ACCEPTED',
    );
    if (!documented) {
      add(
        'CALENDAR_POLICY_EXCEPTION_UNDOCUMENTED',
        'error',
        'structure',
        'Dense resistance schedule lacks an explicit policy exception.',
      );
    } else {
      add(
        'EXCESSIVE_CONSECUTIVE_TRAINING_DAYS',
        'warning',
        'recovery_fit',
        'Calendar uses an explicitly accepted dense resistance schedule.',
      );
    }
  }
  if (
    strategy.resistance_frequency <= 3 &&
    maximumConsecutive(
      calendar.days,
      (day) => day.session_kind === 'full_body',
    ) > 1
  ) {
    add(
      'FULL_BODY_SESSIONS_NOT_SEPARATED',
      'warning',
      'recovery_fit',
      'Consecutive Full Body sessions reduce recovery spacing.',
    );
  }
  calendar.days.slice(1).forEach((day, index) => {
    const previous = calendar.days[index]!;
    const left = previous.demand_profile;
    const right = day.demand_profile;
    if (
      left &&
      right &&
      ((level[left.lower_body] >= 2 && level[right.lower_body] >= 2) ||
        (level[left.hinge] >= 2 && level[right.hinge] >= 2) ||
        (level[left.knee_dominant] >= 2 && level[right.knee_dominant] >= 2))
    ) {
      add(
        'HIGH_FATIGUE_MOVEMENT_OVERLAP',
        'warning',
        'recovery_fit',
        'Adjacent sessions contain high overlapping movement demand.',
        { cycle_days: [previous.cycle_day, day.cycle_day] },
      );
    }
  });
  if (
    maximumConsecutive(
      calendar.days,
      (day) => day.planned_session_type === 'rest',
    ) >= 4
  ) {
    add(
      'UNNECESSARY_LONG_REST_BLOCK',
      'warning',
      'recovery_fit',
      'Calendar contains a long uninterrupted rest block.',
    );
  }

  return findings;
};
