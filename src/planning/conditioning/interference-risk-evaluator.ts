import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import { CONDITIONING_MODALITIES } from './conditioning-policies.js';
import type { ConditioningPrescription } from './conditioning.types.js';

export const evaluateInterferenceRisk = (input: {
  profile: NormalizedAthleteProfile;
  prescription: Pick<
    ConditioningPrescription,
    'conditioning_type' | 'activity_id' | 'duration_min' | 'placement'
  >;
  resistanceDay?: {
    fatigue_classification: 'none' | 'low' | 'moderate' | 'high';
    movement_emphasis: string[];
    title: string;
  };
}): ConditioningPrescription['interference_risk'] => {
  const modality = CONDITIONING_MODALITIES[input.prescription.activity_id];
  const hard = ['threshold', 'intervals', 'sprint_intervals'].includes(
    input.prescription.conditioning_type,
  );
  const lowerResistance =
    input.resistanceDay?.movement_emphasis.some((pattern) =>
      ['squat', 'hinge', 'knee_flexion_isolation'].includes(pattern),
    ) ?? false;
  const beforeResistance = input.prescription.placement === 'before_resistance';
  if (
    hard &&
    modality.impact === 'high' &&
    beforeResistance &&
    lowerResistance &&
    input.profile.source.goal !== 'endurance'
  ) {
    return 'unacceptable';
  }
  let score = 0;
  score += hard ? 2 : 0;
  score +=
    modality.impact === 'high' ? 2 : modality.impact === 'moderate' ? 1 : 0;
  score += modality.lower_body_demand === 'high' && lowerResistance ? 2 : 0;
  score += input.prescription.duration_min > 30 ? 1 : 0;
  score +=
    beforeResistance && input.profile.source.goal !== 'endurance' ? 2 : 0;
  score += input.profile.recovery_capacity === 'low' ? 1 : 0;
  score += input.profile.source.nutrition?.calorie_status === 'deficit' ? 1 : 0;
  return score >= 6 ? 'high' : score >= 3 ? 'moderate' : 'low';
};
