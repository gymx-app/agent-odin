import { DAYS_OF_WEEK } from '../../domain/shared/domain-enums.js';
import {
  DEFAULT_RESISTANCE_POSITIONS,
  demandProfileForSession,
} from './calendar-policies.js';
import type {
  CalendarCandidate,
  CalendarPlannerInput,
  CalendarSessionKind,
  DayOfWeek,
  DemandLevel,
  DemandProfile,
  PlannedCalendarDay,
} from './calendar.types.js';

const combinations = (values: number[], count: number): number[][] => {
  if (count === 0) return [[]];
  if (values.length < count) return [];

  return values.flatMap((value, index) =>
    combinations(values.slice(index + 1), count - 1).map((tail) => [
      value,
      ...tail,
    ]),
  );
};

const sessionKinds = (
  splitType: CalendarPlannerInput['strategy']['split_type'],
  frequency: number,
): CalendarSessionKind[] => {
  if (splitType === 'full_body') {
    return Array.from({ length: frequency }, () => 'full_body');
  }
  if (splitType === 'upper_lower') {
    return Array.from({ length: frequency }, (_, index) =>
      index % 2 === 0 ? 'upper' : 'lower',
    );
  }
  if (splitType === 'push_pull_legs') {
    const order = ['push', 'pull', 'legs'] as const;
    return Array.from(
      { length: frequency },
      (_, index) => order[index % order.length]!,
    );
  }
  // Lower-body-dominant kinds (lower, pull, legs all load hinge/knee/lower_body
  // at moderate-plus) must never sit next to each other in this list: whichever
  // two land on physically adjacent calendar days trips HIGH_FATIGUE_MOVEMENT_OVERLAP
  // (calendar-validator.ts). Alternating with upper/push (both movement-neutral)
  // keeps every adjacent pair, under any resistance-day placement, safe.
  if (frequency === 5) return ['lower', 'upper', 'pull', 'push', 'legs'];
  if (frequency === 4) return ['upper', 'lower', 'upper', 'lower'];
  return Array.from({ length: frequency }, () => 'full_body');
};

const labelForKind = (kind: CalendarSessionKind): string =>
  ({
    full_body: 'Full Body',
    upper: 'Upper Body',
    lower: 'Lower Body',
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    conditioning: 'Conditioning',
    sport: 'Sport',
    recovery: 'Recovery',
    rest: 'Rest',
  })[kind];

const sportDemandProfile = (input: CalendarPlannerInput): DemandProfile => {
  const sport = input.profile.source.sport;
  const level = (value: DemandLevel | undefined): DemandLevel =>
    value ?? 'moderate';

  return {
    systemic: level(sport?.intensity),
    upper_body: level(sport?.upper_body_load),
    lower_body: level(sport?.lower_body_load),
    push: 'none',
    pull: 'none',
    hinge: 'none',
    knee_dominant: sport?.lower_body_load === 'high' ? 'high' : 'moderate',
    impact: level(sport?.impact_level),
  };
};

const inferredSportPositions = (input: CalendarPlannerInput): number[] => {
  const sport = input.profile.source.sport;
  const sessions = sport?.sessions_per_week ?? 0;

  if (sessions === 0) return [];
  if (sport?.session_days) {
    return sport.session_days.map((day) => DAYS_OF_WEEK.indexOf(day) + 1);
  }

  const defaults = [7, 4, 2, 6, 3, 5, 1];
  return defaults.slice(
    0,
    Math.min(sessions, input.strategy.cycle_length_days),
  );
};

const candidatePrefix = (
  input: CalendarPlannerInput,
  positions: number[],
): string => {
  const pattern =
    input.strategy.resistance_frequency === 5
      ? positions.join(',') === '1,2,3,5,6'
        ? '3_1_2_1'
        : positions.join(',') === '1,2,4,5,6'
          ? '2_1_3_1'
          : 'availability'
      : input.strategy.resistance_frequency === 3
        ? 'alternating'
        : input.strategy.resistance_frequency === 4
          ? 'interleaved'
          : 'distributed';

  return `weekly_${input.strategy.resistance_frequency}_${input.strategy.split_type}_${pattern}`;
};

const buildWeeklyCandidate = (
  input: CalendarPlannerInput,
  resistancePositions: number[],
  conditioningPositions: number[],
  sportPositions: number[],
): CalendarCandidate => {
  const kinds = sessionKinds(
    input.strategy.split_type,
    input.strategy.resistance_frequency,
  );
  let resistanceIndex = 0;
  const days: PlannedCalendarDay[] = DAYS_OF_WEEK.map((day_of_week, index) => {
    const cycle_day = index + 1;
    if (sportPositions.includes(cycle_day)) {
      return {
        cycle_day,
        day_of_week,
        session_type: 'sport',
        session_kind: 'sport',
        session_label: input.profile.source.sport?.name ?? 'Sport',
        demand_profile: sportDemandProfile(input),
      };
    }
    if (resistancePositions.includes(cycle_day)) {
      const session_kind = kinds[resistanceIndex++]!;
      return {
        cycle_day,
        day_of_week,
        session_type: 'resistance',
        session_kind,
        session_label: labelForKind(session_kind),
        demand_profile: demandProfileForSession(session_kind),
      };
    }
    if (conditioningPositions.includes(cycle_day)) {
      return {
        cycle_day,
        day_of_week,
        session_type: 'conditioning',
        session_kind: 'conditioning',
        session_label: 'Conditioning',
        demand_profile: demandProfileForSession('conditioning'),
      };
    }
    return {
      cycle_day,
      day_of_week,
      session_type: 'rest',
      session_kind: 'rest',
      session_label: 'Rest',
      demand_profile: demandProfileForSession('rest'),
    };
  });
  const exception =
    input.strategy.resistance_frequency === 6
      ? [
          {
            code: 'SIX_DAY_PPL_DENSITY_ACCEPTED',
            severity: 'information' as const,
            message:
              'Six consecutive PPL sessions use the explicit weekly mode.',
            affected_cycle_days: resistancePositions,
            reason:
              'The strategy explicitly selected a seven-day six-session cycle.',
          },
        ]
      : [];

  return {
    candidate_id: `${candidatePrefix(input, resistancePositions)}_${resistancePositions.join('')}_${conditioningPositions.join('') || 'none'}`,
    cycle_type: 'weekly',
    cycle_length_days: 7,
    days,
    exceptions: exception,
  };
};

const buildRollingCandidate = (
  input: CalendarPlannerInput,
): CalendarCandidate => {
  const kinds = [
    'push',
    'pull',
    'legs',
    'rest',
    'push',
    'pull',
    'legs',
    'rest',
  ] as const;
  return {
    candidate_id: 'rolling_8_ppl_3_1_3_1',
    cycle_type: 'rolling',
    cycle_length_days: 8,
    days: kinds.map((session_kind, index) => ({
      cycle_day: index + 1,
      session_type: session_kind === 'rest' ? 'rest' : 'resistance',
      session_kind,
      session_label: labelForKind(session_kind),
      demand_profile: demandProfileForSession(session_kind),
    })),
    exceptions: [],
  };
};

export const buildCalendarCandidates = (
  input: CalendarPlannerInput,
): CalendarCandidate[] => {
  if (input.strategy.cycle_length_days === 8) {
    return [buildRollingCandidate(input)];
  }

  const sportPositions = inferredSportPositions(input);
  const explicitAvailable = input.profile.source.schedule?.available_days;
  const availablePositions = (explicitAvailable ?? DAYS_OF_WEEK)
    .map((day) => DAYS_OF_WEEK.indexOf(day as DayOfWeek) + 1)
    .filter((position) => !sportPositions.includes(position));
  const resistanceFrequency = input.strategy.resistance_frequency;
  const defaultPositions =
    DEFAULT_RESISTANCE_POSITIONS[resistanceFrequency] ?? [];
  const generatedPositions = combinations(
    availablePositions,
    resistanceFrequency,
  );
  const resistancePositionSets = [
    ...defaultPositions.filter((positions) =>
      positions.every((position) => availablePositions.includes(position)),
    ),
    ...generatedPositions,
  ].filter(
    (positions, index, all) =>
      all.findIndex((candidate) => candidate.join() === positions.join()) ===
      index,
  );

  return resistancePositionSets.flatMap((resistancePositions) => {
    const remaining = availablePositions.filter(
      (position) => !resistancePositions.includes(position),
    );
    return combinations(remaining, input.strategy.conditioning_frequency).map(
      (conditioningPositions) =>
        buildWeeklyCandidate(
          input,
          resistancePositions,
          conditioningPositions,
          sportPositions,
        ),
    );
  });
};
