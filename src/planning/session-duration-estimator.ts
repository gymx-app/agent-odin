import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';

const executionSecondsFor = (exercise: Exercise): number => {
  if (exercise.exercise_type === 'compound') {
    return 45;
  }

  return 35;
};

export const estimateExerciseDurationMinutes = (
  prescription: OdinProgramme['phase_week_templates'][number]['days'][number]['exercises'][number],
  exercise: Exercise,
): number => {
  const executionSeconds =
    prescription.sets.length * executionSecondsFor(exercise);
  const restSeconds = prescription.sets.reduce(
    (total, set) => total + set.rest_seconds,
    0,
  );
  const transitionSeconds = 90;

  return Math.ceil((executionSeconds + restSeconds + transitionSeconds) / 60);
};

export const estimateWorkoutDurationMinutes = (
  prescriptions: OdinProgramme['phase_week_templates'][number]['days'][number]['exercises'],
  exercises: Exercise[],
): number => {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const workMinutes = prescriptions.reduce((total, prescription) => {
    const exercise = exerciseById.get(prescription.exercise_id);

    if (!exercise) {
      return total;
    }

    return total + estimateExerciseDurationMinutes(prescription, exercise);
  }, 0);

  return workMinutes + 8 + 5;
};
