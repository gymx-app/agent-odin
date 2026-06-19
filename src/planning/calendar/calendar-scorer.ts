import {
  CALENDAR_SCORE_WEIGHTS,
  DEFAULT_RESISTANCE_POSITIONS,
  maximumConsecutiveResistanceDays,
} from './calendar-policies.js';
import type {
  CalendarCandidate,
  CalendarPlannerInput,
  DemandProfile,
  ScoredCalendarCandidate,
} from './calendar.types.js';

const level = { none: 0, low: 1, moderate: 2, high: 3 };
const demanding = (day: CalendarCandidate['days'][number]): boolean =>
  level[day.demand_profile.systemic] >= 2;

const maximumConsecutiveDemandingDays = (
  candidate: CalendarCandidate,
): number => {
  let current = 0;
  let maximum = 0;
  candidate.days.forEach((day) => {
    current = demanding(day) ? current + 1 : 0;
    maximum = Math.max(maximum, current);
  });
  return maximum;
};

const overlap = (left: DemandProfile, right: DemandProfile): number =>
  (
    [
      'upper_body',
      'lower_body',
      'push',
      'pull',
      'hinge',
      'knee_dominant',
      'impact',
    ] as const
  ).reduce(
    (total, key) =>
      total +
      (level[left[key]] >= 2 && level[right[key]] >= 2
        ? Math.min(level[left[key]], level[right[key]]) - 1
        : 0),
    0,
  );

const movementOverlapPenalty = (candidate: CalendarCandidate): number =>
  candidate.days
    .slice(1)
    .reduce(
      (total, day, index) =>
        total +
        overlap(candidate.days[index]!.demand_profile, day.demand_profile),
      0,
    );

const sportInterferencePenalty = (
  candidate: CalendarCandidate,
  input: CalendarPlannerInput,
): number =>
  candidate.days.reduce((total, day, index) => {
    if (day.session_type !== 'sport') return total;
    const previous = candidate.days[index - 1];
    const next = candidate.days[index + 1];
    const priorityMultiplier =
      input.profile.source.sport?.priority === 'primary'
        ? 2
        : input.profile.source.sport?.priority === 'equal'
          ? 1.5
          : 1;
    const adjacentLowerDemand = [previous, next].reduce(
      (sum, adjacent) =>
        sum +
        (adjacent && level[adjacent.demand_profile.lower_body] >= 2
          ? level[adjacent.demand_profile.lower_body]
          : 0),
      0,
    );
    return total + adjacentLowerDemand * priorityMultiplier;
  }, 0);

const longestRestBlock = (candidate: CalendarCandidate): number => {
  let maximum = 0;
  let current = 0;
  candidate.days.forEach((day) => {
    current = day.session_type === 'rest' ? current + 1 : 0;
    maximum = Math.max(maximum, current);
  });
  return maximum;
};

const templateSimplicity = (
  candidate: CalendarCandidate,
  input: CalendarPlannerInput,
): number => {
  if (candidate.cycle_type === 'rolling') return 1;
  const positions = candidate.days
    .filter((day) => day.session_type === 'resistance')
    .map((day) => day.cycle_day)
    .join();
  const rank = (
    DEFAULT_RESISTANCE_POSITIONS[input.strategy.resistance_frequency] ?? []
  ).findIndex((template) => template.join() === positions);

  return rank === 0 ? 1 : rank === 1 ? 0.2 : rank >= 2 ? 0.1 : 0;
};

export const scoreCalendarCandidate = (
  candidate: CalendarCandidate,
  input: CalendarPlannerInput,
): ScoredCalendarCandidate => {
  const preferred = new Set(
    input.profile.source.schedule?.preferred_days ?? [],
  );
  const resistanceDays = candidate.days.filter(
    (day) => day.session_type === 'resistance',
  );
  const preferredMatches = resistanceDays.filter(
    (day) => day.day_of_week && preferred.has(day.day_of_week),
  ).length;
  const preferredFit =
    preferred.size === 0
      ? 1
      : preferredMatches / Math.min(preferred.size, resistanceDays.length);
  const consecutive = maximumConsecutiveDemandingDays(candidate);
  const preferredConsecutive = maximumConsecutiveResistanceDays(
    input.strategy.resistance_frequency,
    input.profile.recovery_capacity,
  );
  const recoveryPenalty =
    input.profile.recovery_capacity === 'low'
      ? Math.max(0, consecutive - 1) * 0.3
      : Math.max(0, consecutive - preferredConsecutive) * 0.2;
  const movementPenalty = movementOverlapPenalty(candidate);
  const sportPenalty = sportInterferencePenalty(candidate, input);
  const restBlock = longestRestBlock(candidate);
  const score_breakdown = {
    availability_fit: CALENDAR_SCORE_WEIGHTS.availability_fit,
    preferred_day_fit: CALENDAR_SCORE_WEIGHTS.preferred_day_fit * preferredFit,
    fatigue_distribution:
      CALENDAR_SCORE_WEIGHTS.fatigue_distribution *
      Math.max(0, 1 - recoveryPenalty),
    movement_overlap:
      CALENDAR_SCORE_WEIGHTS.movement_overlap *
      Math.max(0, 1 - movementPenalty / 12),
    sport_interference:
      CALENDAR_SCORE_WEIGHTS.sport_interference *
      Math.max(0, 1 - sportPenalty / 12),
    rest_distribution:
      CALENDAR_SCORE_WEIGHTS.rest_distribution *
      Math.max(0, 1 - Math.max(0, restBlock - 2) / 3),
    schedule_simplicity:
      CALENDAR_SCORE_WEIGHTS.schedule_simplicity *
      templateSimplicity(candidate, input),
  };
  const score = Math.round(
    Object.values(score_breakdown).reduce((total, value) => total + value, 0),
  );

  return {
    ...candidate,
    score,
    score_breakdown,
    maximum_consecutive_demanding_days: consecutive,
    movement_overlap_penalty: movementPenalty,
    sport_interference_penalty: sportPenalty,
    preferred_day_fit: preferredFit,
  };
};

export const compareScoredCandidates = (
  left: ScoredCalendarCandidate,
  right: ScoredCalendarCandidate,
): number =>
  right.score - left.score ||
  left.exceptions.length - right.exceptions.length ||
  right.preferred_day_fit - left.preferred_day_fit ||
  left.maximum_consecutive_demanding_days -
    right.maximum_consecutive_demanding_days ||
  left.movement_overlap_penalty - right.movement_overlap_penalty ||
  left.sport_interference_penalty - right.sport_interference_penalty ||
  (left.cycle_type === right.cycle_type
    ? 0
    : left.cycle_type === 'weekly'
      ? -1
      : 1) ||
  left.candidate_id.localeCompare(right.candidate_id);
