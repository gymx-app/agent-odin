import { AppError } from '../shared/errors/app-error.js';

// These codes mean the LLM provider itself failed or timed out — not that the
// athlete's input was unprocessable. Returning them as 422 caused clients to
// misclassify transient provider timeouts as input-validation errors.
const INFRA_FAILURE_CODES = new Set(['LLM_PROVIDER_TIMEOUT', 'LLM_PROVIDER_ERROR']);

export class RefinementError extends AppError {
  constructor(
    code: string,
    message: string,
    details: unknown = null,
    httpStatus = 422,
  ) {
    super({ code, message, details, httpStatus });
  }
}

export const refinementError = (
  code: string,
  message: string,
  details: unknown = null,
): RefinementError =>
  new RefinementError(code, message, details, INFRA_FAILURE_CODES.has(code) ? 503 : 422);
