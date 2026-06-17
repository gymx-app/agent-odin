import type { AthleteInput } from '../domain/athlete/athlete.types.js';

export const uniqueAssumptions = (assumptions: string[]): string[] => [
  ...new Set(assumptions),
];

export const createBaseAssumptions = (input: AthleteInput): string[] =>
  uniqueAssumptions([
    'Sleep and stress data were not provided.',
    'Detailed training history was not provided.',
    'Current strength levels were not provided.',
    'Nutrition and calorie intake were not provided.',
    'Target timeline was not explicitly provided.',
    input.inbody === null ? 'InBody data was not provided.' : '',
    input.injuries.length === 0
      ? 'No injuries were reported in the source input.'
      : 'Injury diagnosis and clinician restrictions were not provided.',
  ]).filter((assumption) => assumption.length > 0);
