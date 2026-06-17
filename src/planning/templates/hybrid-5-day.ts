import type { WeekSession } from '../planning.types.js';

export const hybrid5DayTemplate: WeekSession[] = [
  { kind: 'upper', emphasis: 'Strength' },
  { kind: 'lower', emphasis: 'Quad Focus' },
  { kind: 'upper', emphasis: 'Hypertrophy' },
  { kind: 'lower', emphasis: 'Posterior Chain' },
  { kind: 'full_body' },
  { kind: 'rest' },
  { kind: 'rest' },
];
