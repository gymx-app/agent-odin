import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { MovementDemandTag } from '../domain/exercise/exercise-taxonomy.js';

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
  movementRestrictions: MovementRestriction[];
  assumptions: string[];
  healthFlags: HealthFlag[];
};

export type MovementRestriction = {
  tag: MovementDemandTag;
  severity: 'modify' | 'avoid';
  source_area: string;
  notes: string;
  source_fields?: string[];
  clinician_restriction?: boolean;
};

export type DerivedStateConfidence = 'low' | 'moderate' | 'high';

export type DerivedStateValue<T extends string> = {
  value: T;
  reason_codes: string[];
  source_fields: string[];
  confidence: DerivedStateConfidence;
};

export type PlanningAssumption = {
  code: string;
  message: string;
  source_fields: string[];
  confidence: DerivedStateConfidence;
};

export type MissingInput = {
  field: string;
  importance: 'optional' | 'recommended' | 'important';
  impact: string;
};

export type NormalizationContext = {
  input: AthleteInput;
  weeklyTrainingMinutes: number;
  weightChange: WeightChangeResult;
  healthFlags: HealthFlag[];
  assumptions: string[];
};
