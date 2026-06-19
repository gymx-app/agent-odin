import type {
  PlannedProgrammeWeek,
  WeekPlannerInput,
  WeekPlanningMetadata,
} from '../weeks/week.types.js';

export const planFatigueBudget = (
  input: WeekPlannerInput,
  weekType: PlannedProgrammeWeek['week_type'],
): WeekPlanningMetadata['fatigue_budget'] => {
  const low =
    weekType === 'deload' ||
    weekType === 'maintenance' ||
    input.profile.recovery_capacity === 'low';
  const high =
    weekType === 'overload' && input.profile.recovery_capacity === 'high';
  const sportLowerBody =
    (input.profile.source.sport?.sessions_per_week ?? 0) >= 2 &&
    input.profile.source.sport?.lower_body_load === 'high';
  const target = low ? 'low' : high ? 'high' : 'moderate';

  return {
    systemic_target: target,
    lower_body_target: sportLowerBody ? 'low' : target,
    upper_body_target: target,
    grip_target: target,
    lower_back_target: low || sportLowerBody ? 'low' : 'moderate',
    conditioning_target:
      (input.profile.source.sport?.sessions_per_week ?? 0) > 0 ? 'low' : target,
    rationale_codes: [
      ...(sportLowerBody ? ['SPORT_LOAD_VOLUME_REDUCED'] : []),
      ...(low ? ['EFFORT_CEILING_REDUCED'] : []),
    ],
  };
};

export const deloadAdjustments = (
  weekType: PlannedProgrammeWeek['week_type'],
): WeekPlanningMetadata['deload_adjustments'] =>
  weekType === 'deload'
    ? {
        volume_factor: 0.65,
        intensity_factor: 0.88,
        effort_factor: 0.82,
        conditioning_factor: 0.7,
        exercise_complexity_reduction: true,
      }
    : undefined;
