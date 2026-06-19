import type {
  AthleteInput,
  NormalizedAthleteProfile,
} from '../domain/athlete/athlete.types.js';
import type { MovementRestriction } from './normalization.types.js';
import {
  classifyEnergyAvailability,
  classifyProteinAdequacy,
} from './nutrition-state.js';
import { classifyRecoveryCapacity } from './recovery-capacity.js';
import { classifySportInterference } from './sport-interference-classifier.js';
import { classifyTrainingStatus } from './training-status-classifier.js';
import type { HealthFlag } from './normalization.types.js';

export const deriveAthleteState = (
  input: AthleteInput,
  weeklyTrainingMinutes: number,
  healthFlags: HealthFlag[],
  movementRestrictions: MovementRestriction[],
): NormalizedAthleteProfile['athlete_state'] => {
  const trainingStatus = classifyTrainingStatus(input);
  const recoveryCapacity = classifyRecoveryCapacity(
    input,
    weeklyTrainingMinutes,
    healthFlags,
  );
  const sportInterference = classifySportInterference(input);
  const hasAvoidRestriction = movementRestrictions.some(
    (restriction) => restriction.severity === 'avoid',
  );
  const scheduleDays = input.schedule?.available_days;
  const consistency = input.training_history?.consistency_last_12_weeks;

  return {
    training_status: trainingStatus,
    schedule_capacity: {
      value: scheduleDays
        ? scheduleDays.length <= 3
          ? 'limited'
          : scheduleDays.length >= 6
            ? 'flexible'
            : 'standard'
        : 'unknown',
      reason_codes: scheduleDays
        ? ['EXPLICIT_AVAILABLE_DAYS']
        : ['EXPLICIT_WEEKDAYS_MISSING'],
      source_fields: scheduleDays ? ['schedule.available_days'] : [],
      confidence: scheduleDays ? ('high' as const) : ('low' as const),
    },
    recovery_capacity: recoveryCapacity,
    movement_limitation_level: {
      value:
        movementRestrictions.length === 0
          ? 'none'
          : hasAvoidRestriction
            ? 'high'
            : 'moderate',
      reason_codes:
        movementRestrictions.length === 0
          ? ['NO_MOVEMENT_RESTRICTIONS']
          : hasAvoidRestriction
            ? ['EXCLUDED_MOVEMENT_DEMAND']
            : ['MODIFIABLE_MOVEMENT_DEMAND'],
      source_fields:
        movementRestrictions.length > 0
          ? ['injuries', 'movement_restrictions']
          : [],
      confidence:
        movementRestrictions.length > 0
          ? ('high' as const)
          : ('moderate' as const),
    },
    energy_availability: classifyEnergyAvailability(input),
    protein_adequacy: classifyProteinAdequacy(input),
    adherence_confidence: {
      value:
        consistency === 'high'
          ? 'high'
          : consistency === 'low'
            ? 'low'
            : consistency === 'moderate'
              ? 'moderate'
              : 'unknown',
      reason_codes: consistency
        ? ['RECENT_CONSISTENCY_REPORTED']
        : ['RECENT_CONSISTENCY_MISSING'],
      source_fields: consistency
        ? ['training_history.consistency_last_12_weeks']
        : [],
      confidence: consistency ? ('high' as const) : ('low' as const),
    },
    sport_interference_risk: sportInterference,
    conditioning_readiness: {
      value:
        recoveryCapacity.value === 'low'
          ? 'low'
          : recoveryCapacity.value === 'high'
            ? 'high'
            : recoveryCapacity.value === 'moderate'
              ? 'moderate'
              : 'unknown',
      reason_codes: ['RECOVERY_CAPACITY_PROXY'],
      source_fields: recoveryCapacity.source_fields,
      confidence: recoveryCapacity.confidence,
    },
    impact_tolerance: {
      value: movementRestrictions.some(
        (restriction) =>
          restriction.tag === 'high_impact' && restriction.severity === 'avoid',
      )
        ? 'low'
        : movementRestrictions.some(
              (restriction) => restriction.tag === 'high_impact',
            )
          ? 'moderate'
          : 'unknown',
      reason_codes: movementRestrictions.some(
        (restriction) => restriction.tag === 'high_impact',
      )
        ? ['IMPACT_RESTRICTION_REPORTED']
        : input.sport?.impact_level
          ? ['SPORT_IMPACT_EXPOSURE_NOT_TOLERANCE']
          : ['IMPACT_TOLERANCE_UNKNOWN'],
      source_fields: movementRestrictions.some(
        (restriction) => restriction.tag === 'high_impact',
      )
        ? ['injuries', 'movement_restrictions']
        : input.sport?.impact_level
          ? ['sport.impact_level']
          : [],
      confidence: movementRestrictions.some(
        (restriction) => restriction.tag === 'high_impact',
      )
        ? ('high' as const)
        : input.sport?.impact_level
          ? ('low' as const)
          : ('low' as const),
    },
  };
};
