import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { DerivedStateValue } from './normalization.types.js';

export const classifySportInterference = (
  input: AthleteInput,
): DerivedStateValue<'none' | 'low' | 'moderate' | 'high' | 'unknown'> => {
  const sport = input.sport;

  if (!sport) {
    return {
      value: 'none',
      reason_codes: ['NO_SPORT_REPORTED'],
      source_fields: [],
      confidence: 'moderate',
    };
  }

  if (sport.sessions_per_week === 0) {
    return {
      value: 'none',
      reason_codes: ['ZERO_SPORT_SESSIONS'],
      source_fields: ['sport.sessions_per_week'],
      confidence: 'high',
    };
  }

  const keyFields = [
    sport.sessions_per_week,
    sport.typical_duration_min,
    sport.intensity,
    sport.priority,
  ];
  if (keyFields.some((value) => value === undefined)) {
    return {
      value: 'unknown',
      reason_codes: ['SPORT_INFORMATION_INCOMPLETE'],
      source_fields: Object.keys(sport).map((field) => `sport.${field}`),
      confidence: 'low',
    };
  }

  let score = 0;
  score += sport.sessions_per_week! >= 3 ? 2 : 1;
  score += sport.typical_duration_min! >= 90 ? 2 : 1;
  score +=
    sport.intensity === 'high' ? 2 : sport.intensity === 'moderate' ? 1 : 0;
  score +=
    sport.priority === 'primary' ? 2 : sport.priority === 'equal' ? 1 : 0;
  score +=
    sport.impact_level === 'high'
      ? 2
      : sport.impact_level === 'moderate'
        ? 1
        : 0;
  score +=
    sport.lower_body_load === 'high'
      ? 2
      : sport.lower_body_load === 'moderate'
        ? 1
        : 0;
  score += sport.upper_body_load === 'high' ? 1 : 0;
  score += sport.sprint_exposure ? 1 : 0;

  return {
    value: score >= 9 ? 'high' : score >= 5 ? 'moderate' : 'low',
    reason_codes: [
      score >= 9
        ? 'HIGH_SPORT_LOAD'
        : score >= 5
          ? 'MODERATE_SPORT_LOAD'
          : 'LOW_SPORT_LOAD',
    ],
    source_fields: Object.keys(sport).map((field) => `sport.${field}`),
    confidence: 'high',
  };
};
