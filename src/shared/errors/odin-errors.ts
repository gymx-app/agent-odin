import { AppError } from './app-error.js';

type OdinErrorOptions = {
  code: string;
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
  code: string,
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
