import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidationMetrics,
} from './validation.types.js';

export const calculateLongitudinalMetrics = (
  programme: LongitudinalOdinProgramme,
  findings: ProgrammeValidationFinding[],
): ProgrammeValidationMetrics => {
  const weeks = programme.phases.flatMap((phase) => phase.weeks);
  const days = weeks.flatMap((week) => week.days);
  const durations = days
    .map((day) => day.estimated_duration_min)
    .filter((duration): duration is number => duration !== null);
  const muscleNames = new Set(
    days.flatMap((day) =>
      day.exercises.flatMap((exercise) => exercise.primary_muscles),
    ),
  );
  const weekly_sets_by_muscle = Object.fromEntries(
    [...muscleNames]
      .sort()
      .map((muscle) => [
        muscle,
        weeks.map((week) =>
          week.days.reduce(
            (total, day) =>
              total +
              day.exercises
                .filter((exercise) => exercise.primary_muscles.includes(muscle))
                .reduce((sum, exercise) => sum + exercise.sets.length, 0),
            0,
          ),
        ),
      ]),
  );
  let maximumConsecutive = 0;
  weeks.forEach((week) => {
    let current = 0;
    week.days.forEach((day) => {
      if (
        day.fatigue_classification === 'high' ||
        day.day_type === 'resistance' ||
        day.day_type === 'sport'
      ) {
        current += 1;
        maximumConsecutive = Math.max(maximumConsecutive, current);
      } else {
        current = 0;
      }
    });
  });

  return {
    phase_count: programme.phases.length,
    week_count: weeks.length,
    cycle_length_days: programme.calendar.cycle_length_days,
    resistance_sessions: days.filter((day) =>
      ['resistance', 'combined'].includes(day.day_type),
    ).length,
    conditioning_sessions: days.filter((day) =>
      day.conditioning.some(
        (item) => item.conditioning_type !== 'sport_conditioning',
      ),
    ).length,
    sport_sessions: days.filter((day) => day.day_type === 'sport').length,
    rest_days: days.filter((day) => day.day_type === 'rest').length,
    total_working_sets: days.reduce(
      (total, day) =>
        total +
        day.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0),
      0,
    ),
    weekly_sets_by_muscle,
    average_session_duration_min:
      durations.length === 0
        ? 0
        : Math.round(
            durations.reduce((sum, duration) => sum + duration, 0) /
              durations.length,
          ),
    maximum_session_duration_min:
      durations.length === 0 ? 0 : Math.max(...durations),
    consecutive_demanding_day_max: maximumConsecutive,
    high_interference_pair_count: days.reduce(
      (count, day) =>
        count +
        day.conditioning.filter((item) => item.interference_risk === 'high')
          .length,
      0,
    ),
    unacceptable_interference_pair_count: days.reduce(
      (count, day) =>
        count +
        day.conditioning.filter(
          (item) => item.interference_risk === 'unacceptable',
        ).length,
      0,
    ),
    deload_week_count: weeks.filter((week) => week.week_type === 'deload')
      .length,
    error_count: findings.filter((item) => item.severity === 'error').length,
    warning_count: findings.filter((item) => item.severity === 'warning')
      .length,
    information_count: findings.filter((item) => item.severity === 'info')
      .length,
  };
};
