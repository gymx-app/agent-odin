import type { AthleteInput } from '../domain/athlete/athlete.types.js';

export type WeightChangeDirection = 'loss' | 'gain' | 'maintain';

export type WeightChangeResult = {
  absolute_change_kg: number;
  percentage_change_from_start: number;
  direction: WeightChangeDirection;
};

export type HealthFlag = {
  code: string;
  severity: 'info' | 'warning' | 'blocking';
  message: string;
};

export type GoalFeasibilityStatus =
  | 'feasible'
  | 'feasible_with_adjusted_expectations'
  | 'insufficient_information';

export type GoalFeasibilityResult = {
  status: GoalFeasibilityStatus;
  reasons: string[];
};

export type InjuryRestrictionResult = {
  restrictedMovementTags: string[];
  assumptions: string[];
  healthFlags: HealthFlag[];
};

export type NormalizationContext = {
  input: AthleteInput;
  weeklyTrainingMinutes: number;
  weightChange: WeightChangeResult;
  healthFlags: HealthFlag[];
  assumptions: string[];
};
