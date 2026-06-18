import { ExerciseEquipmentSchema } from '../domain/exercise/exercise-taxonomy.js';
import { validationCodes } from './validation-codes.js';
import {
  finding,
  programmeExercises,
  uniqueCount,
} from './validation-helpers.js';
import { exerciseDisplayName } from '../planning/programme-labels.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

export const validateExerciseReferences: ProgrammeValidator = ({
  programme,
  exerciseById,
}) => {
  const findings: ProgrammeValidationFinding[] = [];

  programmeExercises(programme).forEach(({ phase_number, day, exercise }) => {
    const approvedExercise = exerciseById.get(exercise.exercise_id);

    if (!approvedExercise) {
      findings.push(
        finding(
          validationCodes.UNKNOWN_EXERCISE_ID,
          'error',
          'exercise_integrity',
          `Exercise ID "${exercise.exercise_id}" is not in the approved library.`,
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
      return;
    }

    if (approvedExercise.status === 'deprecated') {
      findings.push(
        finding(
          validationCodes.DEPRECATED_EXERCISE_USED,
          'error',
          'exercise_integrity',
          `${approvedExercise.name} is deprecated and must not be used.`,
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (exercise.exercise_name !== exerciseDisplayName(approvedExercise.name)) {
      findings.push(
        finding(
          validationCodes.EXERCISE_NAME_MISMATCH,
          'error',
          'exercise_integrity',
          'Exercise display name does not match the approved library name.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (
      exercise.movement_patterns.join('|') !==
      approvedExercise.movement_patterns.join('|')
    ) {
      findings.push(
        finding(
          validationCodes.INVALID_EXERCISE_METADATA,
          'error',
          'exercise_integrity',
          'Programme movement-pattern metadata does not match the approved exercise.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    exercise.equipment.forEach((equipment) => {
      if (!ExerciseEquipmentSchema.safeParse(equipment).success) {
        findings.push(
          finding(
            validationCodes.INVALID_EXERCISE_METADATA,
            'error',
            'exercise_integrity',
            `Unsupported equipment value "${equipment}" is present.`,
            {
              phase_number,
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
            },
          ),
        );
      }
    });
  });

  programme.phase_week_templates.forEach((template) => {
    template.days.forEach((day) => {
      const ids = day.exercises.map((exercise) => exercise.exercise_id);

      if (uniqueCount(ids) !== ids.length) {
        findings.push(
          finding(
            validationCodes.DUPLICATE_EXERCISE_IN_WORKOUT,
            'error',
            'exercise_integrity',
            'Workout contains a duplicate exercise.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }
    });
  });

  return findings;
};
