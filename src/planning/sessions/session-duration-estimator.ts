import type {
  ExercisePrescription,
  ResistanceSessionBuilderInput,
  SessionDurationEstimate,
} from './session.types.js';

export const estimateResistanceSessionDuration = (
  input: ResistanceSessionBuilderInput,
  prescriptions: ExercisePrescription[],
  allowances: {
    warmupDurationSeconds?: number;
    cooldownAllowanceMin?: number;
  } = {},
): SessionDurationEstimate => {
  const exerciseById = new Map(
    input.exercises.map((exercise) => [exercise.id, exercise]),
  );
  let workingSeconds = 0;
  let restSeconds = 0;
  let setupSeconds = 0;
  let previousEquipment = '';

  prescriptions.forEach((prescription) => {
    const exercise = exerciseById.get(prescription.exercise_id);
    workingSeconds +=
      prescription.sets.length *
      (exercise?.exercise_type === 'compound' ? 45 : 35);
    restSeconds += prescription.sets.reduce(
      (sum, set) => sum + set.rest_seconds,
      0,
    );
    const equipment = prescription.equipment.join('|');
    setupSeconds += equipment === previousEquipment ? 45 : 90;
    previousEquipment = equipment;
  });
  const warmup_allowance_min =
    allowances.warmupDurationSeconds === undefined
      ? 8
      : Math.ceil(allowances.warmupDurationSeconds / 60);
  const cooldown_allowance_min = allowances.cooldownAllowanceMin ?? 5;
  const working_time_min = Math.ceil(workingSeconds / 60);
  const rest_time_min = Math.ceil(restSeconds / 60);
  const setup_transition_min = Math.ceil(setupSeconds / 60);

  return {
    estimated_duration_min:
      working_time_min +
      rest_time_min +
      setup_transition_min +
      warmup_allowance_min +
      cooldown_allowance_min,
    working_time_min,
    rest_time_min,
    setup_transition_min,
    warmup_allowance_min,
    cooldown_allowance_min,
  };
};
