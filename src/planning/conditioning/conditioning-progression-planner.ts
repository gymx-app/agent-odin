import type {
  ConditioningRequirement,
  ConditioningType,
} from './conditioning.types.js';
import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';

export const selectConditioningType = (
  requirement: ConditioningRequirement,
  weekType: string,
  sportHasSprints: boolean,
  profile?: NormalizedAthleteProfile,
  options?: { weekNumber?: number; goal?: string },
): ConditioningType => {
  if (weekType === 'deload' || weekType === 'maintenance') {
    return 'active_recovery';
  }
  if (
    requirement === 'performance' &&
    !sportHasSprints &&
    profile?.athlete_state.training_status.value === 'advanced' &&
    profile.athlete_state.conditioning_readiness.value === 'high' &&
    profile.recovery_capacity === 'high'
  ) {
    return 'sprint_intervals';
  }
  if (requirement === 'performance' && !sportHasSprints) return 'intervals';
  if (requirement === 'developmental') {
    if (
      options?.goal === 'fat_loss' &&
      options.weekNumber !== undefined &&
      profile?.athlete_state.training_status.value !== 'beginner' &&
      options.weekNumber % 3 === 0
    ) {
      return 'intervals';
    }
    return 'low_intensity_steady_state';
  }
  if (requirement === 'supportive' || requirement === 'minimum_health') {
    return 'low_intensity_steady_state';
  }
  return 'active_recovery';
};

export const conditioningDurationForWeek = (
  type: ConditioningType,
  weekNumber: number,
  weekType: string,
  maximum: number,
): { duration: number; rationale_code: string } => {
  const deload = weekType === 'deload' || weekType === 'maintenance';
  if (type === 'intervals' || type === 'sprint_intervals') {
    return {
      duration: Math.min(maximum, deload ? 12 : 18),
      rationale_code: deload
        ? 'CONDITIONING_MAINTAINED'
        : 'INTERVAL_COUNT_PROGRESSIVE',
    };
  }
  const base = type === 'active_recovery' ? 15 : 20;
  const progressed = deload
    ? Math.round(base * 0.7)
    : base + (weekNumber - 1) * 5;
  return {
    duration: Math.min(maximum, progressed),
    rationale_code: deload
      ? 'CONDITIONING_MAINTAINED'
      : 'CONDITIONING_DURATION_PROGRESSIVE',
  };
};
