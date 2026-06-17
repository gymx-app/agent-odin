import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { HealthFlag } from './normalization.types.js';

export const estimateRecoveryCapacity = (
  input: AthleteInput,
  weeklyTrainingMinutes: number,
  healthFlags: HealthFlag[],
): 'low' | 'moderate' | 'high' | 'unknown' => {
  const hasAvoidInjury = input.injuries.some(
    (injury) => injury.severity === 'avoid',
  );
  const hasBlockingFlag = healthFlags.some(
    (flag) => flag.severity === 'blocking',
  );
  const hasMultipleInjuries = input.injuries.length >= 2;

  if (hasBlockingFlag || weeklyTrainingMinutes < 60 || hasMultipleInjuries) {
    return 'low';
  }

  if (hasAvoidInjury) {
    return input.fitness_level === 'beginner' ? 'low' : 'moderate';
  }

  if (
    input.fitness_level === 'beginner' &&
    input.available_days_per_week >= 2 &&
    input.available_days_per_week <= 3
  ) {
    return 'moderate';
  }

  if (
    input.fitness_level === 'intermediate' &&
    input.available_days_per_week >= 3 &&
    input.available_days_per_week <= 5
  ) {
    return 'moderate';
  }

  if (
    input.fitness_level === 'advanced' &&
    input.available_days_per_week >= 5 &&
    healthFlags.length === 0 &&
    input.injuries.length === 0 &&
    input.inbody !== null
  ) {
    return 'moderate';
  }

  return 'moderate';
};
