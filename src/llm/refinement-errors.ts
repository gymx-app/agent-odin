import { AppError } from '../shared/errors/app-error.js';

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
): RefinementError => new RefinementError(code, message, details);
