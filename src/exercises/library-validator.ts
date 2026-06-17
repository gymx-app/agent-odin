import { ExerciseSchema } from '../domain/exercise/exercise.schema.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import {
  MOVEMENT_PATTERNS,
  type MovementPattern,
} from '../domain/exercise/exercise-taxonomy.js';

export type ExerciseLibraryValidationIssue = {
  code: string;
  severity: 'warning' | 'error';
  message: string;
  exercise_id?: string;
};

export type ExerciseLibraryValidationResult = {
  valid: boolean;
  issues: ExerciseLibraryValidationIssue[];
};

const resistanceMovementPatterns = MOVEMENT_PATTERNS.filter(
  (pattern) => pattern !== 'liss' && pattern !== 'mobility',
) as MovementPattern[];

export const validateExerciseLibrary = (
  exercises: Exercise[],
): ExerciseLibraryValidationResult => {
  const issues: ExerciseLibraryValidationIssue[] = [];
  const allIds = new Set(exercises.map((exercise) => exercise.id));
  const seenIds = new Set<string>();
  const aliases = new Map<string, string>();
  const substitutionGroups = new Map<string, number>();

  exercises.forEach((exercise) => {
    const parsed = ExerciseSchema.safeParse(exercise);

    if (!parsed.success) {
      issues.push({
        code: 'INVALID_EXERCISE_SCHEMA',
        severity: 'error',
        message: parsed.error.issues.map((issue) => issue.message).join('; '),
        exercise_id: exercise.id,
      });
    }

    if (seenIds.has(exercise.id)) {
      issues.push({
        code: 'DUPLICATE_EXERCISE_ID',
        severity: 'error',
        message: `Duplicate exercise id "${exercise.id}".`,
        exercise_id: exercise.id,
      });
    }

    seenIds.add(exercise.id);

    exercise.aliases.forEach((alias) => {
      const canonicalAlias = alias.trim().toLowerCase().replaceAll(' ', '_');

      if (allIds.has(canonicalAlias) || aliases.has(canonicalAlias)) {
        issues.push({
          code: 'DUPLICATE_ALIAS',
          severity: 'error',
          message: `Alias "${alias}" collides with an exercise id or alias.`,
          exercise_id: exercise.id,
        });
      }

      aliases.set(canonicalAlias, exercise.id);
    });

    if (exercise.substitution_group !== null) {
      substitutionGroups.set(
        exercise.substitution_group,
        (substitutionGroups.get(exercise.substitution_group) ?? 0) + 1,
      );
    }

    if (exercise.status === 'deprecated') {
      issues.push({
        code: 'DEPRECATED_IN_DEFAULT_LIBRARY',
        severity: 'error',
        message: `Deprecated exercise "${exercise.id}" is in the default library.`,
        exercise_id: exercise.id,
      });
    }
  });

  substitutionGroups.forEach((count, group) => {
    if (count < 2) {
      issues.push({
        code: 'SMALL_SUBSTITUTION_GROUP',
        severity: 'warning',
        message: `Substitution group "${group}" has fewer than two exercises.`,
      });
    }
  });

  resistanceMovementPatterns.forEach((pattern) => {
    const activeCount = exercises.filter(
      (exercise) =>
        exercise.status === 'active' &&
        exercise.movement_patterns.includes(pattern),
    ).length;

    if (activeCount < 2) {
      issues.push({
        code: 'INSUFFICIENT_MOVEMENT_PATTERN_COVERAGE',
        severity: 'error',
        message: `Movement pattern "${pattern}" has fewer than two active exercises.`,
      });
    }
  });

  return {
    valid: issues.every((issue) => issue.severity !== 'error'),
    issues,
  };
};
