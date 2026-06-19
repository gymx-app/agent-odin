import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { MovementDemandTag } from '../domain/exercise/exercise-taxonomy.js';
import type {
  InjuryRestrictionResult,
  MovementRestriction,
} from './normalization.types.js';

type Injury = AthleteInput['injuries'][number];

const baseRestrictionTagsByArea: Record<string, MovementDemandTag[]> = {
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
  enrichedRestrictions: AthleteInput['movement_restrictions'] = [],
): InjuryRestrictionResult => {
  const restrictedMovementTags = new Set<string>();
  const movementRestrictions = new Map<string, MovementRestriction>();
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

    baseTags.forEach((tag) => {
      restrictedMovementTags.add(tag);

      const currentRestriction = movementRestrictions.get(tag);
      const nextRestriction: MovementRestriction = {
        tag,
        severity: injury.severity,
        source_area: injury.area,
        notes: injury.notes,
        source_fields: ['injuries'],
      };

      if (!currentRestriction) {
        movementRestrictions.set(tag, nextRestriction);
        return;
      }

      if (
        currentRestriction.severity === 'modify' &&
        injury.severity === 'avoid'
      ) {
        movementRestrictions.set(tag, {
          ...nextRestriction,
          notes: [currentRestriction.notes, injury.notes]
            .filter((note) => note.trim().length > 0)
            .join(' | '),
        });
        return;
      }

      movementRestrictions.set(tag, {
        ...currentRestriction,
        notes: [currentRestriction.notes, injury.notes]
          .filter((note) => note.trim().length > 0)
          .join(' | '),
      });
    });

    if (injury.severity === 'avoid') {
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

  enrichedRestrictions.forEach((restriction) => {
    if (restriction.tolerance === 'eligible') {
      return;
    }

    const severity = restriction.tolerance === 'excluded' ? 'avoid' : 'modify';
    const currentRestriction = movementRestrictions.get(
      restriction.movement_demand,
    );
    const nextRestriction: MovementRestriction = {
      tag: restriction.movement_demand,
      severity,
      source_area: restriction.region,
      notes: restriction.notes ?? '',
      source_fields: ['movement_restrictions'],
      clinician_restriction: restriction.clinician_restriction ?? false,
    };

    restrictedMovementTags.add(restriction.movement_demand);

    if (!currentRestriction) {
      movementRestrictions.set(restriction.movement_demand, nextRestriction);
      return;
    }

    const nextWins =
      currentRestriction.severity === 'modify' && severity === 'avoid';
    const primary = nextWins ? nextRestriction : currentRestriction;
    const secondary = nextWins ? currentRestriction : nextRestriction;

    movementRestrictions.set(restriction.movement_demand, {
      ...primary,
      notes: [primary.notes, secondary.notes]
        .filter((note) => note.trim().length > 0)
        .join(' | '),
      source_fields: [
        ...new Set([
          ...(primary.source_fields ?? []),
          ...(secondary.source_fields ?? []),
        ]),
      ],
      clinician_restriction:
        primary.clinician_restriction ||
        secondary.clinician_restriction ||
        false,
    });
  });

  return {
    restrictedMovementTags: [...restrictedMovementTags],
    movementRestrictions: [...movementRestrictions.values()],
    assumptions: [...assumptions],
    healthFlags,
  };
};
