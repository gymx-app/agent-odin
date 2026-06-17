import type { ProgrammeStrategy, WeekSession } from './planning.types.js';

const padRestDays = (sessions: WeekSession[]): WeekSession[] => {
  const padded = [...sessions];

  while (padded.length < 7) {
    padded.push({ kind: 'rest' });
  }

  return padded.slice(0, 7);
};

export const selectWeeklySplit = (
  strategy: ProgrammeStrategy,
): WeekSession[] => {
  if (strategy.split_type === 'full_body') {
    return padRestDays(
      Array.from({ length: strategy.resistance_days }, () => ({
        kind: 'full_body',
      })),
    );
  }

  if (strategy.split_type === 'upper_lower') {
    return padRestDays([
      { kind: 'upper', emphasis: 'Strength' },
      { kind: 'lower', emphasis: 'Quad Focus' },
      { kind: 'upper', emphasis: 'Hypertrophy' },
      { kind: 'lower', emphasis: 'Posterior Chain' },
    ]);
  }

  if (strategy.split_type === 'push_pull_legs') {
    return padRestDays([
      { kind: 'push' },
      { kind: 'pull' },
      { kind: 'legs' },
      { kind: 'push' },
      { kind: 'pull' },
      { kind: 'legs' },
    ]);
  }

  const base: WeekSession[] = [
    { kind: 'upper', emphasis: 'Strength' },
    { kind: 'lower', emphasis: 'Quad Focus' },
    { kind: 'upper', emphasis: 'Hypertrophy' },
    { kind: 'lower', emphasis: 'Posterior Chain' },
  ];

  if (strategy.resistance_days >= 5) {
    base.push({ kind: 'full_body' });
  }

  for (let index = 0; index < strategy.liss_days; index += 1) {
    base.push({ kind: 'liss' });
  }

  return padRestDays(base);
};
