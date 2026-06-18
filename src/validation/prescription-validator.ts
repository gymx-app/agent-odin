import { validationCodes } from './validation-codes.js';
import {
  containsSpecificWeight,
  finding,
  programmeExercises,
} from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

export const validatePrescriptions: ProgrammeValidator = ({ programme }) => {
  const findings: ProgrammeValidationFinding[] = [];

  programmeExercises(programme).forEach(({ phase_number, day, exercise }) => {
    if (containsSpecificWeight(exercise)) {
      findings.push(
        finding(
          validationCodes.SPECIFIC_WEIGHT_PRESCRIBED,
          'error',
          'prescription_quality',
          'Exercise prescription includes a specific weight value.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (
      exercise.progression_bounds.rep_max < exercise.progression_bounds.rep_min
    ) {
      findings.push(
        finding(
          validationCodes.INVALID_PROGRESSION_BOUNDS,
          'error',
          'prescription_quality',
          'Progression bounds are invalid.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    exercise.sets.forEach((set) => {
      if (
        !Number.isInteger(set.target_reps) ||
        set.target_reps <= 0 ||
        set.target_reps < exercise.progression_bounds.rep_min ||
        set.target_reps > exercise.progression_bounds.rep_max
      ) {
        findings.push(
          finding(
            validationCodes.INVALID_SET_TARGET,
            'error',
            'prescription_quality',
            'Set target reps must be exact positive integers within progression bounds.',
            {
              phase_number,
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
            },
          ),
        );
      }

      if (
        set.target_rpe < 1 ||
        set.target_rpe > 10 ||
        set.rpe_ceiling < 1 ||
        set.rpe_ceiling > 10 ||
        set.target_rpe > set.rpe_ceiling
      ) {
        findings.push(
          finding(
            validationCodes.INVALID_RPE_TARGET,
            'error',
            'prescription_quality',
            'RPE targets must be exact values from 1 to 10 and not exceed the ceiling.',
            {
              phase_number,
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
            },
          ),
        );
      }

      if (!Number.isInteger(set.rest_seconds) || set.rest_seconds < 0) {
        findings.push(
          finding(
            validationCodes.INVALID_REST_TARGET,
            'error',
            'prescription_quality',
            'Rest seconds must be an exact non-negative integer.',
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

  return findings;
};
