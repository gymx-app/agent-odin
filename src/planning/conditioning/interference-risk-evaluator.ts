import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import {
  CONCURRENT_INTERFERENCE_CITATIONS,
  HIIT_INTERFERENCE_CITATIONS,
} from '../evidence.js';
import { CONDITIONING_MODALITIES } from './conditioning-policies.js';
import type { ConditioningPrescription } from './conditioning.types.js';

export type InterferenceRiskResult = {
  interference_risk: ConditioningPrescription['interference_risk'];
  rationale_codes: string[];
};

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
}): InterferenceRiskResult => {
  const modality = CONDITIONING_MODALITIES[input.prescription.activity_id];
  const hard = ['threshold', 'intervals', 'sprint_intervals'].includes(
    input.prescription.conditioning_type,
  );
  const lowerResistance =
    input.resistanceDay?.movement_emphasis.some((pattern) =>
      ['squat', 'hinge', 'knee_flexion_isolation'].includes(pattern),
    ) ?? false;
  const beforeResistance = input.prescription.placement === 'before_resistance';
  // odin-programme-design-logic.md, Section 2: concurrent-training
  // interference is real and modality-dependent (Wilson 2012, corrected by
  // Schumann 2022) — that's cited evidence. The specific point-scoring
  // rubric below that turns those findings into a single low/moderate/high
  // number is a hand-tuned heuristic, not independently validated, and must
  // not be presented with the same confidence as the underlying findings.
  const rationale_codes = [
    ...CONCURRENT_INTERFERENCE_CITATIONS,
    ...(hard ? HIIT_INTERFERENCE_CITATIONS : []),
    'INTERFERENCE_SCORE_THRESHOLD_HEURISTIC',
  ];
  if (
    hard &&
    modality.impact === 'high' &&
    beforeResistance &&
    lowerResistance &&
    input.profile.source.goal !== 'endurance'
  ) {
    return { interference_risk: 'unacceptable', rationale_codes };
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
  return {
    interference_risk: score >= 6 ? 'high' : score >= 3 ? 'moderate' : 'low',
    rationale_codes,
  };
};
