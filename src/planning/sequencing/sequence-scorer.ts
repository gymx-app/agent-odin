import { SEQUENCE_SCORE_WEIGHTS } from './sequence-policies.js';
import type {
  ExerciseSequencingInput,
  SequenceCandidate,
  SequenceScore,
} from './sequencing.types.js';

export const countEquipmentTransitions = (
  candidate: SequenceCandidate,
): number =>
  candidate.prescriptions.reduce((count, exercise, index, all) => {
    if (index === 0) return 0;
    return (
      count +
      (all[index - 1]!.equipment.join('|') === exercise.equipment.join('|')
        ? 0
        : 1)
    );
  }, 0);

export const scoreSequenceCandidate = (
  input: ExerciseSequencingInput,
  candidate: SequenceCandidate,
): SequenceScore => {
  const metadata = new Map(
    input.exercises.map((exercise) => [exercise.id, exercise]),
  );
  const primaryPosition = candidate.prescriptions.findIndex(
    (exercise) => exercise.sequence_role === 'primary',
  );
  const powerPosition = candidate.prescriptions.findIndex(
    (exercise) => exercise.sequence_role === 'power',
  );
  const priorityScore =
    primaryPosition < 0
      ? SEQUENCE_SCORE_WEIGHTS.priority_preservation
      : Math.max(0, 1 - primaryPosition / 3) *
        SEQUENCE_SCORE_WEIGHTS.priority_preservation;
  const powerScore =
    powerPosition < 0
      ? SEQUENCE_SCORE_WEIGHTS.power_preservation
      : powerPosition === 0
        ? SEQUENCE_SCORE_WEIGHTS.power_preservation
        : 0;
  const technicalPenalty = candidate.prescriptions.reduce(
    (penalty, exercise, index) =>
      penalty +
      Math.max(0, (metadata.get(exercise.exercise_id)?.skill_demand ?? 0) - 2) *
        index,
    0,
  );
  const fatiguePenalty = candidate.prescriptions.reduce(
    (penalty, exercise, index) => {
      const item = metadata.get(exercise.exercise_id);
      return (
        penalty +
        (candidate.prescriptions.length - index - 1) *
          Math.max(
            item?.fatigue_cost.grip ?? 0,
            item?.fatigue_cost.axial ?? 0,
            item?.fatigue_cost.systemic ?? 0,
          )
      );
    },
    0,
  );
  const transitions = countEquipmentTransitions(candidate);
  const orderingChanges = candidate.prescriptions.reduce(
    (changes, exercise, index) =>
      changes +
      (input.session.day.exercises[index]?.exercise_id === exercise.exercise_id
        ? 0
        : 1),
    0,
  );
  const technicalScore = Math.max(
    0,
    SEQUENCE_SCORE_WEIGHTS.technical_quality - technicalPenalty,
  );
  const fatigueScore = Math.max(
    0,
    SEQUENCE_SCORE_WEIGHTS.fatigue_interference - fatiguePenalty / 5,
  );
  const equipmentScore = Math.max(
    0,
    SEQUENCE_SCORE_WEIGHTS.equipment_efficiency - transitions * 2,
  );
  const durationScore = Math.max(
    0,
    SEQUENCE_SCORE_WEIGHTS.duration_efficiency - transitions,
  );

  return {
    total:
      priorityScore +
      powerScore +
      technicalScore +
      fatigueScore +
      equipmentScore +
      durationScore +
      (candidate.exception_codes.some((code) =>
        [
          'PRIORITY_ISOLATION_ADVANCED',
          'PRE_EXHAUST_STRATEGY_APPLIED',
        ].includes(code),
      )
        ? 20
        : 0),
    primary_position: primaryPosition < 0 ? 0 : primaryPosition,
    fatigue_penalty: fatiguePenalty,
    equipment_transitions: transitions,
    ordering_changes: orderingChanges,
  };
};
