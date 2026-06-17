import type { WeekSession } from '../planning.types.js';

export const pushPullLegs6DayTemplate: WeekSession[] = [
  { kind: 'push' },
  { kind: 'pull' },
  { kind: 'legs' },
  { kind: 'push' },
  { kind: 'pull' },
  { kind: 'legs' },
  { kind: 'rest' },
];
