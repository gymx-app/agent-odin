export const WEEK_FACTOR_BOUNDS = {
  volume: { min: 0.5, max: 1.4 },
  intensity: { min: 0.75, max: 1.25 },
  effort: { min: 0.75, max: 1.2 },
} as const;

export const WEEK_FACTORS = {
  introduction: { volume: 0.8, intensity: 0.9, effort: 0.85 },
  loading: { volume: 1, intensity: 1, effort: 1 },
  overload: { volume: 1.08, intensity: 1.03, effort: 1.03 },
  deload: { volume: 0.65, intensity: 0.88, effort: 0.82 },
  testing: { volume: 0.65, intensity: 1.15, effort: 1.08 },
  maintenance: { volume: 0.85, intensity: 0.98, effort: 0.92 },
} as const;

export const MAX_WEEKLY_VOLUME_INCREASE = {
  beginner: 0.08,
  returning: 0.06,
  intermediate: 0.1,
  advanced: 0.12,
  unknown: 0.08,
} as const;

export const estimateMaximumSessionSets = (
  sessionDurationMinutes: number,
): number => Math.max(1, Math.floor((sessionDurationMinutes - 13) / 3.5));
