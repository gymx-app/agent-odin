import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import {
  CONDITIONING_MODALITIES,
  MODALITY_PREFERENCE_ORDER,
} from './conditioning-policies.js';
import type {
  ConditioningModality,
  ConditioningType,
} from './conditioning.types.js';

export type ModalitySelection = {
  modality: ConditioningModality;
  status: 'eligible' | 'modifiable';
  restriction_tags: string[];
  rationale_codes: string[];
};

const equipmentAvailable = (
  profile: NormalizedAthleteProfile,
  modality: ConditioningModality,
): boolean => {
  const required = CONDITIONING_MODALITIES[modality].required_equipment;
  if (required.length === 0 || required.includes('other')) return true;
  return required.some((item) =>
    profile.equipment_capabilities.available_equipment.includes(item),
  );
};

export const selectConditioningModality = (
  profile: NormalizedAthleteProfile,
  type: ConditioningType,
): ModalitySelection => {
  const avoid = new Set(
    profile.movement_restrictions
      .filter((restriction) => restriction.severity === 'avoid')
      .map((restriction) => restriction.tag),
  );
  const modify = new Set(
    profile.movement_restrictions
      .filter((restriction) => restriction.severity === 'modify')
      .map((restriction) => restriction.tag),
  );
  const lowImpactRequired =
    profile.athlete_state.impact_tolerance.value === 'low' ||
    profile.source.current_weight_kg >= 110 ||
    avoid.has('high_impact');
  const ordered =
    type === 'sprint_intervals'
      ? (['assault_bike', 'stationary_bike', 'running'] as const)
      : MODALITY_PREFERENCE_ORDER;

  for (const modality of ordered) {
    const candidate = CONDITIONING_MODALITIES[modality];
    if (!equipmentAvailable(profile, modality)) continue;
    if (lowImpactRequired && candidate.impact === 'high') continue;
    if (candidate.restriction_tags.some((tag) => avoid.has(tag))) continue;
    const modificationTags = candidate.restriction_tags.filter((tag) =>
      modify.has(tag),
    );
    return {
      modality,
      status: modificationTags.length > 0 ? 'modifiable' : 'eligible',
      restriction_tags: modificationTags,
      rationale_codes: [
        candidate.impact === 'low'
          ? 'LOW_IMPACT_MODALITY_SELECTED'
          : 'CONDITIONING_MODALITY_SELECTED',
        ...(lowImpactRequired ? ['MOVEMENT_RESTRICTION_MODALITY_CHANGED'] : []),
      ],
    };
  }

  return {
    modality: 'other_approved',
    status: 'modifiable',
    restriction_tags: [...avoid],
    rationale_codes: ['MOVEMENT_RESTRICTION_MODALITY_CHANGED'],
  };
};
