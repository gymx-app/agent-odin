import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import {
  CONDITIONING_MODALITIES,
  type ModalityProfile,
} from './conditioning-policies.js';
import { planConditioningIntensity } from './conditioning-intensity-planner.js';
import { evaluateInterferenceRisk } from './interference-risk-evaluator.js';
import type {
  ConditioningModality,
  ConditioningPrescription,
  ConditioningType,
} from './conditioning.types.js';

type ResistanceDay =
  LongitudinalOdinProgramme['phases'][number]['weeks'][number]['days'][number];

const MIN_FINISHER_MINUTES = 8;
const MAX_FINISHER_MINUTES = 15;

const sessionKindFromDay = (day: ResistanceDay): string =>
  day.session_metadata?.session_kind ?? '';

const finisherType = (
  goal: string,
  weekType: string,
): ConditioningType | undefined => {
  if (weekType === 'deload' || weekType === 'maintenance') return undefined;
  if (goal === 'fat_loss') return 'moderate_continuous';
  if (goal === 'endurance') return 'low_intensity_steady_state';
  return 'low_intensity_steady_state';
};

const demandConflicts = (
  sessionKind: string,
): { lower: boolean; grip: boolean } => {
  const lower = ['lower', 'legs', 'full_body'].includes(sessionKind);
  const grip = ['pull', 'upper', 'full_body'].includes(sessionKind);
  return { lower, grip };
};

const FINISHER_MODALITY_ORDER: ConditioningModality[] = [
  'stationary_bike',
  'walking',
  'incline_walking',
  'elliptical',
  'rowing',
  'assault_bike',
];

const selectFinisherModality = (
  profile: NormalizedAthleteProfile,
  sessionKind: string,
): {
  modality: ConditioningModality;
  rationale_codes: string[];
} => {
  const conflicts = demandConflicts(sessionKind);
  const avoid = new Set(
    profile.movement_restrictions
      .filter((restriction) => restriction.severity === 'avoid')
      .map((restriction) => restriction.tag),
  );
  const lowImpactRequired =
    profile.athlete_state.impact_tolerance.value === 'low' ||
    profile.source.current_weight_kg >= 110 ||
    avoid.has('high_impact');

  for (const modality of FINISHER_MODALITY_ORDER) {
    const candidate: ModalityProfile = CONDITIONING_MODALITIES[modality];
    const equipment = candidate.required_equipment;
    const hasEquipment =
      equipment.length === 0 ||
      equipment.includes('other') ||
      equipment.some((item) =>
        profile.equipment_capabilities.available_equipment.includes(item),
      );
    if (!hasEquipment) continue;
    if (lowImpactRequired && candidate.impact === 'high') continue;
    if (candidate.restriction_tags.some((tag) => avoid.has(tag))) continue;
    if (conflicts.lower && candidate.lower_body_demand === 'high') continue;
    if (conflicts.grip && candidate.grip_demand !== 'low') continue;
    return {
      modality,
      rationale_codes: ['FINISHER_MODALITY_SELECTED'],
    };
  }

  return {
    modality: 'walking',
    rationale_codes: ['FINISHER_MODALITY_FALLBACK_WALKING'],
  };
};

export const planResistanceSessionFinisher = (
  profile: NormalizedAthleteProfile,
  strategy: LongitudinalOdinProgramme['strategy'],
  day: ResistanceDay,
  weekType: string,
): ConditioningPrescription | undefined => {
  const type = finisherType(profile.source.goal, weekType);
  if (!type) return undefined;

  const available =
    (day.maximum_duration_min ?? profile.source.session_duration_min) -
    (day.estimated_duration_min ?? 0);
  if (available < MIN_FINISHER_MINUTES) return undefined;

  const sessionKind = sessionKindFromDay(day);
  const { modality, rationale_codes } = selectFinisherModality(
    profile,
    sessionKind,
  );
  const duration = Math.min(MAX_FINISHER_MINUTES, available);
  const intensity = planConditioningIntensity(type, profile);

  const base = {
    conditioning_type: type,
    activity_id: modality,
    duration_min: duration,
    placement: 'after_resistance' as const,
  };
  const risk = evaluateInterferenceRisk({
    profile,
    prescription: base,
    resistanceDay: day,
  });
  if (risk === 'unacceptable' || risk === 'high') return undefined;

  return {
    conditioning_id: `${day.day_id}-finisher`,
    display_order: (day.exercises.at(-1)?.display_order ?? 0) + 1,
    ...base,
    activity_name: `${CONDITIONING_MODALITIES[modality].display_name} Finisher`,
    purpose: 'Utilise remaining session time for supplemental energy expenditure.',
    intensity: intensity.intensity,
    ...(intensity.intervals ? { intervals: intensity.intervals } : {}),
    impact_level: CONDITIONING_MODALITIES[modality].impact,
    fatigue_cost: 'low',
    interference_risk: risk,
    progression_policy_id: 'conditioning-v2',
    rationale: [
      ...rationale_codes,
      ...intensity.rationale_codes,
      'FINISHER_PLACED_AFTER_RESISTANCE',
      `FINISHER_AVAILABLE_${duration}_MIN`,
    ],
  };
};
