import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type {
  ProgrammeValidationFinding,
  ValidationCategory,
  ValidationSeverity,
} from './validation.types.js';
import type { ValidationCode } from './validation-codes.js';

export const finding = (
  code: ValidationCode,
  severity: ValidationSeverity,
  category: ValidationCategory,
  message: string,
  options: Partial<
    Pick<
      ProgrammeValidationFinding,
      'phase_number' | 'day_of_week' | 'exercise_id' | 'metadata'
    >
  > = {},
): ProgrammeValidationFinding => ({
  code,
  severity,
  category,
  message,
  phase_number: options.phase_number ?? null,
  day_of_week: options.day_of_week ?? null,
  exercise_id: options.exercise_id ?? null,
  ...(options.metadata ? { metadata: options.metadata } : {}),
});

export const uniqueCount = <Value>(values: Value[]): number =>
  new Set(values).size;

export const programmeExercises = (programme: OdinProgramme) =>
  programme.phase_week_templates.flatMap((template) =>
    template.days.flatMap((day) =>
      day.exercises.map((exercise) => ({
        phase_number: template.phase_number,
        day,
        exercise,
      })),
    ),
  );

export const findExercise = (
  exerciseById: Map<string, Exercise>,
  exerciseId: string,
): Exercise | undefined => exerciseById.get(exerciseId);

export const containsSpecificWeight = (value: unknown): boolean => {
  const serialized = JSON.stringify(value).toLowerCase();

  return /\b\d+(\.\d+)?\s?(kg|lb|lbs|pounds)\b/.test(serialized);
};
