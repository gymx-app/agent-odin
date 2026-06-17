export type AppErrorOptions = {
  code: string;
  message: string;
  httpStatus: number;
  details?: unknown;
  cause?: unknown;
};

export class AppError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly details?: unknown;
  override readonly cause?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = new.target.name;
    this.code = options.code;
    this.httpStatus = options.httpStatus;

    if ('details' in options) {
      this.details = options.details;
    }

    if ('cause' in options) {
      this.cause = options.cause;
    }
  }
}
