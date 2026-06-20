import { PlannerError } from '../../planning/planner-errors.js';
import { AppError } from '../../shared/errors/app-error.js';
import { odinError } from '../../shared/errors/odin-errors.js';

export const safeGenerationErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Programme generation failed.';

export const toSafeGenerationError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof PlannerError) {
    if (error.code === 'INVALID_EXERCISE_LIBRARY') {
      return odinError(
        'EXERCISE_LIBRARY_INVALID',
        'Exercise library failed validation.',
        500,
      );
    }

    return odinError(
      'GENERATED_PROGRAMME_INVALID',
      'Generated programme failed deterministic planning.',
      422,
      { planner_code: error.code, planner_details: error.details },
    );
  }

  return odinError(
    'INTERNAL_SERVER_ERROR',
    'Programme generation failed.',
    500,
  );
};
