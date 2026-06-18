import { AppError } from './app-error.js';

type HttpErrorOptions = {
  code?: string;
  message?: string;
  details?: unknown;
  cause?: unknown;
};

const createOptions = (
  code: string,
  defaultMessage: string,
  httpStatus: number,
  options: HttpErrorOptions = {},
) => ({
  code: options.code ?? code,
  message: options.message ?? defaultMessage,
  httpStatus,
  details: options.details,
  cause: options.cause,
});

export class BadRequestError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(createOptions('BAD_REQUEST', 'Bad request.', 400, options));
  }
}

export class UnauthorizedError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(createOptions('UNAUTHORIZED', 'Unauthorized.', 401, options));
  }
}

export class ForbiddenError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(createOptions('FORBIDDEN', 'Forbidden.', 403, options));
  }
}

export class NotFoundError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(createOptions('NOT_FOUND', 'Not found.', 404, options));
  }
}

export class MethodNotAllowedError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(
      createOptions('METHOD_NOT_ALLOWED', 'Method not allowed.', 405, options),
    );
  }
}

export class InternalServerError extends AppError {
  constructor(options: HttpErrorOptions = {}) {
    super(
      createOptions(
        'INTERNAL_SERVER_ERROR',
        'Internal server error.',
        500,
        options,
      ),
    );
  }
}
