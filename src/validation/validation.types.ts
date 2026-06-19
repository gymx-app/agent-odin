import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { ValidationCode } from './validation-codes.js';
import type { DAYS_OF_WEEK } from '../domain/shared/domain-enums.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';

export type ValidationSeverity = 'info' | 'warning' | 'error';

export type ValidationCategory =
  | 'structure'
  | 'constraint_fit'
  | 'exercise_integrity'
  | 'movement_balance'
  | 'recovery_fit'
  | 'fatigue_management'
  | 'goal_specificity'
  | 'progression_quality'
  | 'session_time_fit'
  | 'prescription_quality'
  | 'naming_quality';

export type ProgrammeValidationFinding = {
  code: ValidationCode;
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  phase_number: number | null;
  day_of_week: (typeof DAYS_OF_WEEK)[number] | null;
  exercise_id: string | null;
  metadata?: Record<string, unknown>;
};

export type ProgrammeValidationScores = Record<ValidationCategory, number>;

export type ProgrammeValidationReport = {
  passed: boolean;
  status: 'pass' | 'pass_with_warnings' | 'fail';
  overall_score: number;
  scores: ProgrammeValidationScores;
  findings: ProgrammeValidationFinding[];
  summary: {
    error_count: number;
    warning_count: number;
    info_count: number;
  };
  metrics?: ProgrammeValidationMetrics;
  evaluated_rule_versions?: RuleVersionReference[];
  repair?: ProgrammeRepairMetadata;
};

export type ProgrammeValidationMetrics = {
  phase_count: number;
  week_count: number;
  cycle_length_days: number;
  resistance_sessions: number;
  conditioning_sessions: number;
  sport_sessions: number;
  rest_days: number;
  total_working_sets: number;
  weekly_sets_by_muscle: Record<string, number[]>;
  average_session_duration_min: number;
  maximum_session_duration_min: number;
  consecutive_demanding_day_max: number;
  high_interference_pair_count: number;
  unacceptable_interference_pair_count: number;
  deload_week_count: number;
  error_count: number;
  warning_count: number;
  information_count: number;
};

export type RuleVersionReference = {
  rule_id: string;
  version: number;
};

export type DeterministicRepairOperation = {
  operation_id: string;
  operation_type:
    | 'correct_display_order'
    | 'reorder_exercise'
    | 'reduce_conditioning_duration'
    | 'move_conditioning_to_separate_day'
    | 'remove_duplicate_sport_conditioning'
    | 'adjust_rpe_ceiling'
    | 'shorten_nonessential_warmup';
  target_id: string;
  reason_code: string;
  affected_finding_codes: ValidationCode[];
};

export type ProgrammeRepairMetadata = {
  attempted: boolean;
  applied: boolean;
  operation_count: number;
  operations: DeterministicRepairOperation[];
  rejection_reason?: string;
};

export type LongitudinalValidationRule = {
  id: string;
  version: number;
  validate: (
    programme: LongitudinalOdinProgramme,
    profile: NormalizedAthleteProfile,
    exercises: Exercise[],
  ) => ProgrammeValidationFinding[];
};

export type ValidatorContext = {
  programme: OdinProgramme;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  exerciseById: Map<string, Exercise>;
};

export type ProgrammeValidator = (
  context: ValidatorContext,
) => ProgrammeValidationFinding[];

export type ProgrammeValidationRuleVersion = `programme-validation/v${number}`;

export type RegisteredProgrammeValidationRule = {
  id: string;
  version: number;
  validate: ProgrammeValidator;
};

export type ProgrammeValidationRuleSet = {
  version: ProgrammeValidationRuleVersion;
  rules: readonly RegisteredProgrammeValidationRule[];
};
