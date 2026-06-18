import { validationCodes } from './validation-codes.js';
import {
  containsSpecificWeight,
  finding,
  programmeExercises,
} from './validation-helpers.js';
import type { ProgrammeValidator } from './validation.types.js';

export const validateProgression: ProgrammeValidator = ({ programme }) =>
  programmeExercises(programme).flatMap(({ phase_number, day, exercise }) => {
    const findings = [];
    const rule = exercise.progression_rule.toLowerCase();

    if (exercise.progression_rule.trim().length === 0) {
      findings.push(
        finding(
          validationCodes.MISSING_PROGRESSION_RULE,
          'error',
          'progression_quality',
          'Exercise is missing a progression rule.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (
      !rule.includes('increase target reps') ||
      !rule.includes('increase load') ||
      !rule.includes('reset')
    ) {
      findings.push(
        finding(
          validationCodes.WEAK_PROGRESSION_RULE,
          'warning',
          'progression_quality',
          'Progression rule should describe rep progression, load increase and reset behavior.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (containsSpecificWeight(exercise.progression_rule)) {
      findings.push(
        finding(
          validationCodes.SPECIFIC_WEIGHT_PRESCRIBED,
          'error',
          'progression_quality',
          'Progression rule prescribes a specific weight value.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    return findings;
  });
