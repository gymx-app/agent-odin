import type { CalendarSessionKind, DemandProfile } from './calendar.types.js';

export const CALENDAR_SCORE_WEIGHTS = {
  availability_fit: 30,
  preferred_day_fit: 10,
  fatigue_distribution: 20,
  movement_overlap: 15,
  sport_interference: 15,
  rest_distribution: 5,
  schedule_simplicity: 5,
} as const;

export const DEFAULT_RESISTANCE_POSITIONS: Record<number, number[][]> = {
  2: [
    [1, 4],
    [2, 5],
    [1, 5],
  ],
  3: [
    [1, 3, 5],
    [2, 4, 6],
    [1, 4, 6],
  ],
  4: [
    [1, 2, 4, 5],
    [2, 3, 5, 6],
    [1, 3, 5, 7],
  ],
  5: [
    [1, 2, 3, 5, 6],
    [1, 2, 4, 5, 6],
  ],
  6: [[1, 2, 3, 4, 5, 6]],
};

export const maximumConsecutiveResistanceDays = (
  frequency: number,
  recovery: string,
): number => {
  if (frequency <= 3) return 1;
  if (frequency === 4) return 2;
  if (frequency === 5) return recovery === 'low' ? 2 : 3;
  return 6;
};

const none: DemandProfile = {
  systemic: 'none',
  upper_body: 'none',
  lower_body: 'none',
  push: 'none',
  pull: 'none',
  hinge: 'none',
  knee_dominant: 'none',
  impact: 'none',
};

export const demandProfileForSession = (
  kind: CalendarSessionKind,
): DemandProfile => {
  const profiles: Record<CalendarSessionKind, DemandProfile> = {
    full_body: {
      systemic: 'high',
      upper_body: 'moderate',
      lower_body: 'moderate',
      push: 'moderate',
      pull: 'moderate',
      hinge: 'moderate',
      knee_dominant: 'moderate',
      impact: 'low',
    },
    upper: {
      ...none,
      systemic: 'moderate',
      upper_body: 'high',
      push: 'moderate',
      pull: 'moderate',
    },
    lower: {
      ...none,
      systemic: 'high',
      lower_body: 'high',
      hinge: 'moderate',
      knee_dominant: 'high',
      impact: 'moderate',
    },
    push: {
      ...none,
      systemic: 'moderate',
      upper_body: 'high',
      push: 'high',
    },
    pull: {
      ...none,
      systemic: 'moderate',
      upper_body: 'high',
      pull: 'high',
      hinge: 'moderate',
    },
    legs: {
      ...none,
      systemic: 'high',
      lower_body: 'high',
      hinge: 'moderate',
      knee_dominant: 'high',
      impact: 'moderate',
    },
    conditioning: { ...none, systemic: 'low', impact: 'low' },
    sport: { ...none, systemic: 'moderate', impact: 'moderate' },
    recovery: { ...none, systemic: 'low' },
    rest: none,
  };

  return profiles[kind];
};
