import type { WeekSession } from '../planning.types.js';

export const upperLower4DayTemplate: WeekSession[] = [
  { kind: 'upper', emphasis: 'Strength' },
  { kind: 'lower', emphasis: 'Quad Focus' },
  { kind: 'rest' },
  { kind: 'upper', emphasis: 'Hypertrophy' },
  { kind: 'lower', emphasis: 'Posterior Chain' },
  { kind: 'rest' },
  { kind: 'rest' },
];
