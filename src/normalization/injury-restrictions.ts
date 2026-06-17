import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { InjuryRestrictionResult } from './normalization.types.js';

type Injury = AthleteInput['injuries'][number];

const baseRestrictionTagsByArea: Record<string, string[]> = {
  knee: ['loaded_deep_knee_flexion', 'high_impact', 'single_leg_loading'],
  lower_back: [
    'high_spinal_compression',
    'loaded_spinal_flexion',
    'unsupported_hip_hinge',
  ],
  wrist: ['high_wrist_extension', 'fixed_pronated_grip'],
  shoulder: [
    'overhead_loading',
    'deep_shoulder_extension',
    'high_abduction_loading',
  ],
  elbow: ['high_elbow_flexion_load', 'high_elbow_extension_load'],
  ankle: ['high_impact', 'deep_ankle_dorsiflexion'],
};

const avoidOnlyRestrictionTagsByArea: Record<string, string[]> = {
  knee: ['avoid_loaded_deep_knee_flexion', 'avoid_high_impact'],
  lower_back: ['avoid_high_spinal_compression', 'avoid_loaded_spinal_flexion'],
  wrist: ['avoid_high_wrist_extension'],
  shoulder: ['avoid_overhead_loading'],
  elbow: ['avoid_high_elbow_loading'],
  ankle: ['avoid_high_impact'],
};

const normalizeInjuryArea = (area: string): string =>
  area.trim().toLowerCase().replaceAll('-', '_').replaceAll(' ', '_');

const mapAreaAlias = (area: string): string => {
  const normalizedArea = normalizeInjuryArea(area);

  if (['back', 'low_back', 'lowerback', 'lumbar'].includes(normalizedArea)) {
    return 'lower_back';
  }

  return normalizedArea;
};

const isVagueArea = (area: string): boolean =>
  ['pain', 'joint', 'ache', 'unknown', 'general'].includes(
    normalizeInjuryArea(area),
  );

export const mapInjuriesToRestrictions = (
  injuries: AthleteInput['injuries'],
): InjuryRestrictionResult => {
  const restrictedMovementTags = new Set<string>();
  const assumptions = new Set<string>();
  const healthFlags: InjuryRestrictionResult['healthFlags'] = [];

  injuries.forEach((injury: Injury) => {
    const mappedArea = mapAreaAlias(injury.area);
    const baseTags = baseRestrictionTagsByArea[mappedArea];

    if (!baseTags) {
      const severity = isVagueArea(injury.area) ? 'warning' : 'info';
      healthFlags.push({
        code: 'UNKNOWN_INJURY_AREA',
        severity,
        message: `Injury area "${injury.area}" does not have a Phase 2 movement-tag mapping.`,
      });
      assumptions.add(
        `Injury area "${injury.area}" requires manual movement restriction review.`,
      );
      return;
    }

    baseTags.forEach((tag) => restrictedMovementTags.add(tag));

    if (injury.severity === 'avoid') {
      avoidOnlyRestrictionTagsByArea[mappedArea]?.forEach((tag) =>
        restrictedMovementTags.add(tag),
      );
      healthFlags.push({
        code: 'AVOID_SEVERITY_INJURY',
        severity: 'warning',
        message: `Injury area "${injury.area}" is marked avoid and should constrain exercise selection.`,
      });
    }

    if (injury.notes.trim().length > 0) {
      assumptions.add(`Injury note for ${injury.area}: ${injury.notes.trim()}`);
    } else {
      assumptions.add(
        `Injury diagnosis and clinician restrictions were not provided for ${injury.area}.`,
      );
    }
  });

  return {
    restrictedMovementTags: [...restrictedMovementTags],
    assumptions: [...assumptions],
    healthFlags,
  };
};
