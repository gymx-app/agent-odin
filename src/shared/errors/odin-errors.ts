import { AppError } from './app-error.js';

export type OdinErrorCode =
  | 'AGENT_RUN_PERSISTENCE_FAILED'
  | 'AI_GENERATION_PROVIDER_MISSING'
  | 'ATHLETE_PROFILE_INVALID'
  | 'ATHLETE_PROFILE_NOT_FOUND'
  | 'ATHLETE_PROFILE_PERSISTENCE_FAILED'
  | 'BAD_REQUEST'
  | 'CURRENT_PROGRAMME_NOT_FOUND'
  | 'DRAFT_PROGRAMME_ALREADY_EXISTS'
  | 'ENDPOINT_DEPRECATED'
  | 'EXERCISE_LIBRARY_INVALID'
  | 'GENERATED_PROGRAMME_INVALID'
  | 'GENERATION_ALREADY_IN_PROGRESS'
  | 'GENERATION_TIMEOUT'
  | 'IDEMPOTENCY_FINALIZATION_FAILED'
  | 'IDEMPOTENCY_KEY_CONFLICT'
  | 'IDEMPOTENCY_REQUEST_IN_PROGRESS'
  | 'INBODY_API_ERROR'
  | 'INBODY_PARSE_FAILED'
  | 'INVALID_PHASE_INDEX'
  | 'INVALID_STEP'
  | 'PROGRAMME_NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'INVALID_PROGRAMME_ID'
  | 'PLANNER_VERSION_DISABLED'
  | 'PREGNANCY_POSTPARTUM_BLOCKED'
  | 'PROGRAMME_BUILD_FAILED'
  | 'PLANNER_VERSION_UNSUPPORTED'
  | 'PROGRAMME_PERSISTENCE_FAILED'
  | 'SUPABASE_CONFIG_MISSING';

type OdinErrorOptions = {
  code: OdinErrorCode;
  message: string;
  httpStatus: number;
  details?: unknown;
  cause?: unknown;
};

export class OdinError extends AppError {
  constructor(options: OdinErrorOptions) {
    super(options);
  }
}

export const odinError = (
  code: OdinErrorCode,
  message: string,
  httpStatus: number,
  details?: unknown,
  cause?: unknown,
): OdinError =>
  new OdinError({
    code,
    message,
    httpStatus,
    details,
    cause,
  });
