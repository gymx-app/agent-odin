import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { DerivedStateValue } from './normalization.types.js';

export type TrainingStatus =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'returning'
  | 'unknown';

export const TRAINING_STATUS_THRESHOLDS = {
  returningDetrainingWeeks: 8,
  intermediateYears: 1,
  advancedYears: 4,
} as const;

export const classifyTrainingStatus = (
  input: AthleteInput,
): DerivedStateValue<TrainingStatus> => {
  const history = input.training_history;

  if (!history) {
    return {
      value: input.fitness_level,
      reason_codes: [
        'LEGACY_FITNESS_LEVEL_ONLY',
        'TRAINING_HISTORY_INCOMPLETE',
      ],
      source_fields: ['fitness_level'],
      confidence: 'low',
    };
  }

  const sourceFields = Object.keys(history).map(
    (field) => `training_history.${field}`,
  );
  const reasons: string[] = [];

  if (
    (history.detraining_weeks ?? 0) >=
      TRAINING_STATUS_THRESHOLDS.returningDetrainingWeeks ||
    (history.weeks_since_last_consistent_block ?? 0) >=
      TRAINING_STATUS_THRESHOLDS.returningDetrainingWeeks
  ) {
    return {
      value: 'returning',
      reason_codes: ['RECENT_DETRAINING'],
      source_fields: sourceFields,
      confidence: 'high',
    };
  }

  if (history.consistency_last_12_weeks === 'low') {
    reasons.push('LOW_RECENT_CONSISTENCY');
  }

  if (
    history.years_consistent_training !== undefined &&
    history.consistency_last_12_weeks !== undefined
  ) {
    reasons.push('CONSISTENT_TRAINING_HISTORY');
  }

  if (history.exercise_competency === 'advanced') {
    reasons.push('ADVANCED_COMPETENCY_REPORTED');
  }

  const conflictsWithLegacy =
    (input.fitness_level === 'advanced' &&
      history.exercise_competency === 'novice') ||
    (input.fitness_level === 'beginner' &&
      history.exercise_competency === 'advanced');

  if (conflictsWithLegacy) {
    return {
      value: 'unknown',
      reason_codes: ['FITNESS_HISTORY_CONFLICT'],
      source_fields: ['fitness_level', ...sourceFields],
      confidence: 'low',
    };
  }

  const completeSignals =
    history.years_consistent_training !== undefined &&
    history.consistency_last_12_weeks !== undefined &&
    history.exercise_competency !== undefined;

  if (
    completeSignals &&
    history.years_consistent_training! >=
      TRAINING_STATUS_THRESHOLDS.advancedYears &&
    history.consistency_last_12_weeks === 'high' &&
    history.exercise_competency === 'advanced'
  ) {
    return {
      value: 'advanced',
      reason_codes: reasons,
      source_fields: sourceFields,
      confidence: 'high',
    };
  }

  if (
    history.years_consistent_training !== undefined &&
    history.years_consistent_training >=
      TRAINING_STATUS_THRESHOLDS.intermediateYears &&
    history.consistency_last_12_weeks !== 'low' &&
    history.exercise_competency !== 'novice'
  ) {
    return {
      value: 'intermediate',
      reason_codes: reasons,
      source_fields: sourceFields,
      confidence: completeSignals ? 'high' : 'moderate',
    };
  }

  if (
    history.exercise_competency === 'novice' ||
    (history.years_consistent_training !== undefined &&
      history.years_consistent_training <
        TRAINING_STATUS_THRESHOLDS.intermediateYears)
  ) {
    return {
      value: 'beginner',
      reason_codes: reasons.length > 0 ? reasons : ['NOVICE_TRAINING_HISTORY'],
      source_fields: sourceFields,
      confidence: completeSignals ? 'high' : 'moderate',
    };
  }

  return {
    value: input.fitness_level,
    reason_codes: ['TRAINING_HISTORY_INCOMPLETE'],
    source_fields: ['fitness_level', ...sourceFields],
    confidence: 'low',
  };
};
