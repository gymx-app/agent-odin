import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { DerivedStateValue, HealthFlag } from './normalization.types.js';

type RecoveryCapacity = 'low' | 'moderate' | 'high' | 'unknown';

export const classifyRecoveryCapacity = (
  input: AthleteInput,
  weeklyTrainingMinutes: number,
  healthFlags: HealthFlag[],
): DerivedStateValue<RecoveryCapacity> => {
  if (!input.lifestyle && !input.nutrition && !input.sport) {
    return {
      value: estimateLegacyRecoveryCapacity(
        input,
        weeklyTrainingMinutes,
        healthFlags,
      ),
      reason_codes: ['LEGACY_RECOVERY_INPUTS_ONLY'],
      source_fields: [
        'fitness_level',
        'available_days_per_week',
        'session_duration_min',
        'injuries',
        'inbody',
      ],
      confidence: 'low',
    };
  }

  if (healthFlags.some((flag) => flag.severity === 'blocking')) {
    return {
      value: 'low',
      reason_codes: ['BLOCKING_HEALTH_FLAG'],
      source_fields: ['health_flags'],
      confidence: 'high',
    };
  }

  let score = 0;
  const reasons: string[] = [];
  const sourceFields: string[] = [];
  const lifestyle = input.lifestyle;

  if (lifestyle?.sleep_hours !== undefined) {
    sourceFields.push('lifestyle.sleep_hours');
    score +=
      lifestyle.sleep_hours >= 7 ? 2 : lifestyle.sleep_hours < 6 ? -2 : 0;
    reasons.push(
      lifestyle.sleep_hours >= 7
        ? 'ADEQUATE_SLEEP_DURATION'
        : 'LIMITED_SLEEP_DURATION',
    );
  }
  if (lifestyle?.sleep_quality !== undefined) {
    sourceFields.push('lifestyle.sleep_quality');
    score +=
      lifestyle.sleep_quality >= 7 ? 1 : lifestyle.sleep_quality <= 4 ? -1 : 0;
  }
  if (lifestyle?.perceived_stress !== undefined) {
    sourceFields.push('lifestyle.perceived_stress');
    score +=
      lifestyle.perceived_stress >= 8
        ? -2
        : lifestyle.perceived_stress <= 4
          ? 1
          : 0;
  }
  if (lifestyle?.recovery_rating !== undefined) {
    sourceFields.push('lifestyle.recovery_rating');
    score +=
      lifestyle.recovery_rating >= 7
        ? 2
        : lifestyle.recovery_rating <= 4
          ? -2
          : 0;
  }
  if (lifestyle?.shift_work) {
    sourceFields.push('lifestyle.shift_work');
    score -= 2;
    reasons.push('SHIFT_WORK_REPORTED');
  }
  if (lifestyle?.occupation_type === 'manual') {
    sourceFields.push('lifestyle.occupation_type');
    score -= 1;
  }
  if (input.nutrition?.calorie_status === 'deficit') {
    sourceFields.push('nutrition.calorie_status');
    score -= 1;
  }
  if (
    input.sport?.intensity === 'high' &&
    (input.sport.sessions_per_week ?? 0) >= 2
  ) {
    sourceFields.push('sport.intensity', 'sport.sessions_per_week');
    score -= 2;
    reasons.push('HIGH_SPORT_LOAD');
  }
  if (input.training_history?.consistency_last_12_weeks === 'high') {
    sourceFields.push('training_history.consistency_last_12_weeks');
    score += 1;
  }
  if (input.injuries.some((injury) => injury.severity === 'avoid')) {
    sourceFields.push('injuries');
    score -= 1;
  }
  if (weeklyTrainingMinutes >= 600) {
    sourceFields.push('available_days_per_week', 'session_duration_min');
    score -= 1;
  }
  if (input.age >= 60) {
    sourceFields.push('age');
    score -= 1;
    reasons.push('AGE_MINOR_RECOVERY_SIGNAL');
  }

  const signalCount = sourceFields.length;
  const value: RecoveryCapacity =
    score <= -3 ? 'low' : score >= 4 ? 'high' : 'moderate';

  return {
    value,
    reason_codes:
      reasons.length > 0 ? reasons : ['MULTI_FACTOR_RECOVERY_ESTIMATE'],
    source_fields: [...new Set(sourceFields)],
    confidence:
      signalCount >= 4 ? 'high' : signalCount >= 2 ? 'moderate' : 'low',
  };
};

const estimateLegacyRecoveryCapacity = (
  input: AthleteInput,
  weeklyTrainingMinutes: number,
  healthFlags: HealthFlag[],
): 'low' | 'moderate' | 'high' | 'unknown' => {
  const hasAvoidInjury = input.injuries.some(
    (injury) => injury.severity === 'avoid',
  );
  const hasBlockingFlag = healthFlags.some(
    (flag) => flag.severity === 'blocking',
  );
  const hasMultipleInjuries = input.injuries.length >= 2;

  if (hasBlockingFlag || weeklyTrainingMinutes < 60 || hasMultipleInjuries) {
    return 'low';
  }

  if (hasAvoidInjury) {
    return input.fitness_level === 'beginner' ? 'low' : 'moderate';
  }

  if (
    input.fitness_level === 'beginner' &&
    input.available_days_per_week >= 2 &&
    input.available_days_per_week <= 3
  ) {
    return 'moderate';
  }

  if (
    input.fitness_level === 'intermediate' &&
    input.available_days_per_week >= 3 &&
    input.available_days_per_week <= 5
  ) {
    return 'moderate';
  }

  if (
    input.fitness_level === 'advanced' &&
    input.available_days_per_week >= 5 &&
    healthFlags.length === 0 &&
    input.injuries.length === 0 &&
    input.inbody !== null
  ) {
    return 'moderate';
  }

  return 'moderate';
};

export const estimateRecoveryCapacity = (
  input: AthleteInput,
  weeklyTrainingMinutes: number,
  healthFlags: HealthFlag[],
): RecoveryCapacity =>
  classifyRecoveryCapacity(input, weeklyTrainingMinutes, healthFlags).value;
