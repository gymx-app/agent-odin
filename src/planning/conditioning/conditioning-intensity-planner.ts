import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { ConditioningPrescription } from './conditioning.types.js';

export const planConditioningIntensity = (
  type: ConditioningPrescription['conditioning_type'],
  profile: NormalizedAthleteProfile,
): {
  intensity: ConditioningPrescription['intensity'];
  intervals?: NonNullable<ConditioningPrescription['intervals']>;
  rationale_codes: string[];
} => {
  if (type === 'intervals' || type === 'sprint_intervals') {
    const sprint = type === 'sprint_intervals';
    return {
      intensity: {
        method: 'session_rpe',
        target_min: sprint ? 9 : 8,
        target_max: sprint ? 9 : 8,
      },
      intervals: {
        work_seconds: sprint ? 20 : 60,
        recovery_seconds: sprint ? 100 : 120,
        interval_count:
          profile.athlete_state.training_status.value === 'beginner' ? 5 : 6,
        work_intensity: {
          method: 'session_rpe',
          target_min: sprint ? 9 : 8,
          target_max: sprint ? 9 : 8,
        },
        recovery_intensity: {
          method: 'session_rpe',
          target_min: 2,
          target_max: 2,
        },
      },
      rationale_codes: ['EXACT_INTERVAL_STRUCTURE_PRESCRIBED'],
    };
  }
  const targets: Record<
    Exclude<
      ConditioningPrescription['conditioning_type'],
      'intervals' | 'sprint_intervals'
    >,
    [number, number]
  > = {
    low_intensity_steady_state: [3, 3],
    moderate_continuous: [5, 5],
    threshold: [7, 7],
    sport_conditioning: [2, 9],
    active_recovery: [2, 2],
    movement_target: [2, 3],
  };
  const [target_min, target_max] = targets[type];
  return {
    intensity: {
      method: type === 'movement_target' ? 'talk_test' : 'session_rpe',
      ...(type === 'movement_target'
        ? { target_label: 'Comfortable conversational pace' }
        : { target_min, target_max }),
    },
    rationale_codes: ['MEASURABLE_CONDITIONING_INTENSITY_SELECTED'],
  };
};
