import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

const primaryMusclesForDay = (
  day: Parameters<ProgrammeValidator>[0]['programme']['phase_week_templates'][number]['days'][number],
) => new Set(day.exercises.flatMap((exercise) => exercise.primary_muscles));

export const validateRecovery: ProgrammeValidator = ({
  programme,
  exerciseById,
}) => {
  const findings: ProgrammeValidationFinding[] = [];

  programme.phase_week_templates.forEach((template) => {
    template.days.slice(0, -1).forEach((day, index) => {
      const nextDay = template.days[index + 1]!;
      const dayMuscles = primaryMusclesForDay(day);
      const nextMuscles = primaryMusclesForDay(nextDay);
      const sharedMuscles = [...dayMuscles].filter((muscle) =>
        nextMuscles.has(muscle),
      );
      const axialToday = day.exercises.some((exercise) => {
        const approvedExercise = exerciseById.get(exercise.exercise_id);

        return approvedExercise && approvedExercise.fatigue_cost.axial >= 4;
      });
      const axialTomorrow = nextDay.exercises.some((exercise) => {
        const approvedExercise = exerciseById.get(exercise.exercise_id);

        return approvedExercise && approvedExercise.fatigue_cost.axial >= 4;
      });
      const gripToday = day.exercises.some((exercise) => {
        const approvedExercise = exerciseById.get(exercise.exercise_id);

        return approvedExercise && approvedExercise.fatigue_cost.grip >= 4;
      });
      const gripTomorrow = nextDay.exercises.some((exercise) => {
        const approvedExercise = exerciseById.get(exercise.exercise_id);

        return approvedExercise && approvedExercise.fatigue_cost.grip >= 4;
      });

      if (
        sharedMuscles.length > 0 &&
        day.workout_type === 'workout' &&
        nextDay.workout_type === 'workout'
      ) {
        findings.push(
          finding(
            validationCodes.CONSECUTIVE_MUSCLE_OVERLAP,
            'warning',
            'recovery_fit',
            'Consecutive workouts repeat primary muscle emphasis.',
            {
              phase_number: template.phase_number,
              day_of_week: nextDay.day_of_week,
              metadata: { sharedMuscles },
            },
          ),
        );
      }

      if (axialToday && axialTomorrow) {
        findings.push(
          finding(
            validationCodes.CONSECUTIVE_AXIAL_FATIGUE,
            'error',
            'recovery_fit',
            'Consecutive days contain high axial loading.',
            {
              phase_number: template.phase_number,
              day_of_week: nextDay.day_of_week,
            },
          ),
        );
      }

      if (gripToday && gripTomorrow) {
        findings.push(
          finding(
            validationCodes.CONSECUTIVE_GRIP_OVERLAP,
            'warning',
            'recovery_fit',
            'Consecutive days contain high grip loading.',
            {
              phase_number: template.phase_number,
              day_of_week: nextDay.day_of_week,
            },
          ),
        );
      }
    });
  });

  return findings;
};
