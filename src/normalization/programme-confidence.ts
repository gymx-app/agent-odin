import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type {
  HealthFlag,
  MissingInput,
  WeightChangeResult,
} from './normalization.types.js';

export const calculateProgrammeConfidence = (
  input: AthleteInput,
  weightChange: WeightChangeResult,
  healthFlags: HealthFlag[],
  assumptions: string[],
  missingInputs: MissingInput[] = [],
): 'low' | 'medium' | 'high' => {
  if (healthFlags.some((flag) => flag.severity === 'blocking')) {
    return 'low';
  }

  let score = 2;

  if (input.inbody !== null) {
    score += 1;
  } else {
    score -= 1;
  }

  const hasUnknownInjuryArea = healthFlags.some(
    (flag) => flag.code === 'UNKNOWN_INJURY_AREA',
  );

  if (hasUnknownInjuryArea) {
    score -= 1;
  } else {
    score += 1;
  }

  const hasDirectionMismatch = healthFlags.some(
    (flag) => flag.code === 'GOAL_TARGET_DIRECTION_MISMATCH',
  );

  if (hasDirectionMismatch) {
    score -= 2;
  } else {
    score += 1;
  }

  if (healthFlags.some((flag) => flag.code === 'LARGE_WEIGHT_CHANGE_REQUEST')) {
    score -= 1;
  }

  if (healthFlags.some((flag) => flag.code === 'AVOID_SEVERITY_INJURY')) {
    score -= 1;
  }

  if (assumptions.length >= 6) {
    score -= 1;
  }

  score -= missingInputs.filter(
    (missing) => missing.importance === 'important',
  ).length;
  score -= Math.floor(
    missingInputs.filter((missing) => missing.importance === 'recommended')
      .length / 2,
  );

  if (
    input.training_history &&
    input.schedule?.available_days &&
    input.lifestyle &&
    input.nutrition?.calorie_status &&
    input.nutrition.calorie_status !== 'unknown'
  ) {
    score += 3;
  }

  if (weightChange.direction === 'maintain') {
    score += 0;
  }

  if (score <= 1) {
    return 'low';
  }

  if (
    score >= 6 &&
    (input.inbody !== null || input.training_history !== undefined) &&
    assumptions.length <= 4 &&
    healthFlags.length === 0
  ) {
    return 'high';
  }

  return 'medium';
};
