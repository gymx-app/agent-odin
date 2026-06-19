import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { DerivedStateValue } from './normalization.types.js';

export const classifyEnergyAvailability = (
  input: AthleteInput,
): DerivedStateValue<'deficit' | 'maintenance' | 'surplus' | 'unknown'> => {
  const status = input.nutrition?.calorie_status;

  if (status && status !== 'unknown') {
    return {
      value: status,
      reason_codes: ['EXPLICIT_CALORIE_STATUS'],
      source_fields: ['nutrition.calorie_status'],
      confidence: 'high',
    };
  }

  return {
    value: 'unknown',
    reason_codes:
      input.goal === 'fat_loss'
        ? ['CALORIE_STATUS_UNKNOWN', 'FAT_LOSS_DEFICIT_INTENT_ONLY']
        : ['CALORIE_STATUS_UNKNOWN'],
    source_fields: status ? ['nutrition.calorie_status'] : [],
    confidence: 'low',
  };
};

export const classifyProteinAdequacy = (
  input: AthleteInput,
): DerivedStateValue<
  'likely_inadequate' | 'uncertain' | 'likely_adequate' | 'unknown'
> => {
  const intake = input.nutrition?.estimated_protein_g_per_day;
  const suppliedConfidence = input.nutrition?.protein_adequacy_confidence;

  if (intake === undefined) {
    return {
      value: 'unknown',
      reason_codes: ['PROTEIN_INTAKE_MISSING'],
      source_fields: [],
      confidence: 'low',
    };
  }

  const gramsPerKg = intake / input.current_weight_kg;
  const value =
    gramsPerKg < 1.2
      ? 'likely_inadequate'
      : gramsPerKg >= 1.6
        ? 'likely_adequate'
        : 'uncertain';

  return {
    value,
    reason_codes: [
      value === 'likely_inadequate'
        ? 'PROTEIN_BELOW_REFERENCE_RANGE'
        : value === 'likely_adequate'
          ? 'PROTEIN_WITHIN_REFERENCE_RANGE'
          : 'PROTEIN_NEAR_REFERENCE_BOUNDARY',
    ],
    source_fields: [
      'nutrition.estimated_protein_g_per_day',
      'current_weight_kg',
      ...(suppliedConfidence ? ['nutrition.protein_adequacy_confidence'] : []),
    ],
    confidence: suppliedConfidence ?? 'moderate',
  };
};
