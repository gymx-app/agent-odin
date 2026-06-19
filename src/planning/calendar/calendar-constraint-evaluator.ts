import { DAYS_OF_WEEK } from '../../domain/shared/domain-enums.js';
import { maximumConsecutiveResistanceDays } from './calendar-policies.js';
import type {
  CalendarCandidate,
  CalendarConstraintFailure,
  CalendarPlannerInput,
} from './calendar.types.js';

const count = (
  candidate: CalendarCandidate,
  type: CalendarCandidate['days'][number]['session_type'],
): number => candidate.days.filter((day) => day.session_type === type).length;

const maxConsecutive = (
  candidate: CalendarCandidate,
  predicate: (day: CalendarCandidate['days'][number]) => boolean,
): number => {
  let maximum = 0;
  let current = 0;
  candidate.days.forEach((day) => {
    current = predicate(day) ? current + 1 : 0;
    maximum = Math.max(maximum, current);
  });
  return maximum;
};

export const evaluateCalendarConstraints = (
  candidate: CalendarCandidate,
  input: CalendarPlannerInput,
): CalendarConstraintFailure[] => {
  const failures: CalendarConstraintFailure[] = [];
  const expectedLength = candidate.cycle_type === 'weekly' ? 7 : 8;
  const cycleDays = candidate.days.map((day) => day.cycle_day);

  if (
    candidate.cycle_length_days !== expectedLength ||
    candidate.days.length !== expectedLength
  ) {
    failures.push({
      code: 'INVALID_CALENDAR_CYCLE_LENGTH',
      message: 'Calendar length does not match its cycle type.',
      affected_cycle_days: cycleDays,
    });
  }
  if (new Set(cycleDays).size !== cycleDays.length) {
    failures.push({
      code: 'DUPLICATE_CYCLE_DAY',
      message: 'Calendar contains duplicate cycle days.',
      affected_cycle_days: cycleDays,
    });
  }
  if (cycleDays.some((day, index) => day !== index + 1)) {
    failures.push({
      code: 'NON_CONSECUTIVE_CYCLE_DAY',
      message: 'Calendar cycle days are not consecutive.',
      affected_cycle_days: cycleDays,
    });
  }
  if (
    candidate.cycle_type === 'rolling' &&
    (!input.profile.source.schedule?.rolling_schedule_acceptable ||
      input.strategy.cycle_length_days !== 8)
  ) {
    failures.push({
      code: 'INVALID_ROLLING_SCHEDULE',
      message: 'The athlete or strategy does not permit an eight-day cycle.',
      affected_cycle_days: cycleDays,
    });
  }
  const unavailable = new Set(
    input.profile.source.schedule?.unavailable_days ?? [],
  );
  const unavailableTraining = candidate.days.filter(
    (day) =>
      day.day_of_week &&
      unavailable.has(day.day_of_week) &&
      day.session_type !== 'rest',
  );
  if (unavailableTraining.length > 0) {
    failures.push({
      code: 'SESSION_ON_UNAVAILABLE_DAY',
      message: 'Calendar schedules training on an unavailable weekday.',
      affected_cycle_days: unavailableTraining.map((day) => day.cycle_day),
    });
  }
  if (count(candidate, 'resistance') !== input.strategy.resistance_frequency) {
    failures.push({
      code: 'RESISTANCE_FREQUENCY_MISMATCH',
      message: 'Resistance frequency does not match the strategy.',
      affected_cycle_days: cycleDays,
    });
  }
  if (
    count(candidate, 'conditioning') !== input.strategy.conditioning_frequency
  ) {
    failures.push({
      code: 'CONDITIONING_FREQUENCY_MISMATCH',
      message: 'Conditioning frequency does not match the strategy.',
      affected_cycle_days: cycleDays,
    });
  }
  const expectedSport = input.profile.source.sport?.sessions_per_week ?? 0;
  if (
    candidate.cycle_type === 'weekly' &&
    count(candidate, 'sport') !== expectedSport
  ) {
    failures.push({
      code: 'SPORT_SESSION_MISSING',
      message: 'Calendar does not contain every reported sport session.',
      affected_cycle_days: cycleDays,
    });
  }
  const limit = maximumConsecutiveResistanceDays(
    input.strategy.resistance_frequency,
    input.profile.recovery_capacity,
  );
  const consecutiveResistance = maxConsecutive(
    candidate,
    (day) => day.session_type === 'resistance',
  );
  const documentedSixDayException =
    input.strategy.resistance_frequency === 6 &&
    candidate.exceptions.some(
      (exception) => exception.code === 'SIX_DAY_PPL_DENSITY_ACCEPTED',
    );
  if (consecutiveResistance > limit && !documentedSixDayException) {
    failures.push({
      code: 'EXCESSIVE_CONSECUTIVE_TRAINING_DAYS',
      message: 'Calendar exceeds the consecutive resistance-day policy.',
      affected_cycle_days: cycleDays,
    });
  }
  if (
    input.strategy.resistance_frequency <= 3 &&
    maxConsecutive(candidate, (day) => day.session_kind === 'full_body') > 1
  ) {
    failures.push({
      code: 'FULL_BODY_SESSIONS_NOT_SEPARATED',
      message:
        'Full Body sessions must be separated where a valid alternative exists.',
      affected_cycle_days: cycleDays,
    });
  }

  return failures;
};
