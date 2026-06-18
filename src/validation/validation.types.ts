import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { ValidationCode } from './validation-codes.js';
import type { DAYS_OF_WEEK } from '../domain/shared/domain-enums.js';

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
