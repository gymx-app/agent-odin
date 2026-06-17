import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { WeightChangeResult } from './normalization.types.js';

const roundToOneDecimal = (value: number): number =>
  Math.round(value * 10) / 10;

export const calculateWeightChange = (
  input: Pick<AthleteInput, 'current_weight_kg' | 'target_weight_kg'>,
): WeightChangeResult => {
  const difference = input.target_weight_kg - input.current_weight_kg;
  const absoluteChangeKg = Math.abs(difference);
  const percentageChangeFromStart =
    (absoluteChangeKg / input.current_weight_kg) * 100;

  return {
    absolute_change_kg: roundToOneDecimal(absoluteChangeKg),
    percentage_change_from_start: roundToOneDecimal(percentageChangeFromStart),
    direction: difference < 0 ? 'loss' : difference > 0 ? 'gain' : 'maintain',
  };
};
