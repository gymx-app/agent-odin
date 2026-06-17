export type PlannerErrorCode =
  | 'NO_ELIGIBLE_EXERCISE'
  | 'REQUIRED_MOVEMENT_SLOT_UNFILLED'
  | 'SESSION_DURATION_UNSATISFIABLE'
  | 'UNSUPPORTED_TRAINING_SCHEDULE'
  | 'INVALID_EXERCISE_LIBRARY'
  | 'PROGRAMME_SCHEMA_VALIDATION_FAILED'
  | 'INVALID_SET_PRESCRIPTION';

export class PlannerError extends Error {
  readonly code: PlannerErrorCode;
  readonly details: unknown;

  constructor(
    code: PlannerErrorCode,
    message: string,
    details: unknown = null,
  ) {
    super(message);
    this.name = 'PlannerError';
    this.code = code;
    this.details = details;
  }
}
