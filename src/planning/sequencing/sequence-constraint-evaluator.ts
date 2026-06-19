import { isPull, requiresHighTrunkStability } from './sequence-policies.js';
import type {
  ExerciseSequencingInput,
  SequenceCandidate,
  SequenceConstraintViolation,
} from './sequencing.types.js';

export const evaluateSequenceConstraints = (
  input: ExerciseSequencingInput,
  candidate: SequenceCandidate,
): SequenceConstraintViolation[] => {
  const violations: SequenceConstraintViolation[] = [];
  const metadata = new Map(
    input.exercises.map((exercise) => [exercise.id, exercise]),
  );
  const primaryIndex = candidate.prescriptions.findIndex(
    (exercise) => exercise.sequence_role === 'primary',
  );
  const powerIndex = candidate.prescriptions.findIndex(
    (exercise) => exercise.sequence_role === 'power',
  );

  candidate.prescriptions.forEach((exercise, index) => {
    const approved = metadata.get(exercise.exercise_id);
    if (
      !approved ||
      input.profile.excluded_exercise_ids.includes(exercise.exercise_id)
    ) {
      violations.push({
        code: 'EXCLUDED_EXERCISE_SELECTED',
        kind: 'hard_invalidity',
        affected_exercise_ids: [exercise.exercise_id],
      });
      return;
    }
    const prior = candidate.prescriptions.slice(0, index);
    const priorMetadata = prior
      .map((item) => metadata.get(item.exercise_id))
      .filter((item): item is NonNullable<typeof item> => item !== undefined);

    if (
      exercise.sequence_role === 'power' &&
      priorMetadata.some((item) => item.fatigue_cost.systemic >= 3)
    ) {
      violations.push({
        code: 'POWER_EXERCISE_AFTER_FATIGUING_WORK',
        kind: 'performance_compromise',
        affected_exercise_ids: [
          ...prior.map((item) => item.exercise_id),
          exercise.exercise_id,
        ],
      });
    }
    if (
      exercise.sequence_role === 'primary' &&
      isPull(exercise) &&
      priorMetadata.some((item) => item.fatigue_cost.grip >= 4)
    ) {
      violations.push({
        code: 'GRIP_FATIGUE_SEQUENCE_CONFLICT',
        kind: 'unjustified_fatigue',
        affected_exercise_ids: [
          ...prior.map((item) => item.exercise_id),
          exercise.exercise_id,
        ],
      });
    }
    if (
      exercise.sequence_role === 'primary' &&
      exercise.movement_patterns.some((pattern) =>
        ['hinge', 'horizontal_pull'].includes(pattern),
      ) &&
      priorMetadata.some((item) => item.fatigue_cost.axial >= 4)
    ) {
      violations.push({
        code: 'LOWER_BACK_FATIGUE_SEQUENCE_CONFLICT',
        kind: 'unjustified_fatigue',
        affected_exercise_ids: [
          ...prior.map((item) => item.exercise_id),
          exercise.exercise_id,
        ],
      });
    }
    if (
      requiresHighTrunkStability(exercise) &&
      prior.some((item) => {
        const itemMetadata = metadata.get(item.exercise_id);
        return (
          item.sequence_role === 'core' &&
          Math.max(
            itemMetadata?.fatigue_cost.local ?? 0,
            itemMetadata?.fatigue_cost.systemic ?? 0,
          ) >= 4
        );
      })
    ) {
      violations.push({
        code: 'CORE_FATIGUE_SEQUENCE_CONFLICT',
        kind: 'technical_quality_compromise',
        affected_exercise_ids: [
          ...prior
            .filter((item) => item.sequence_role === 'core')
            .map((item) => item.exercise_id),
          exercise.exercise_id,
        ],
      });
    }
  });

  if (primaryIndex > (powerIndex === 0 ? 1 : 0)) {
    const preceding = candidate.prescriptions.slice(0, primaryIndex);
    if (
      preceding.some(
        (exercise) =>
          !['power', 'primary'].includes(exercise.sequence_role) &&
          !candidate.exception_codes.some((code) =>
            [
              'PRIORITY_ISOLATION_ADVANCED',
              'PRE_EXHAUST_STRATEGY_APPLIED',
            ].includes(code),
          ),
      )
    ) {
      violations.push({
        code: 'PRIORITY_EXERCISE_PLACED_TOO_LATE',
        kind: 'performance_compromise',
        affected_exercise_ids: [
          candidate.prescriptions[primaryIndex]!.exercise_id,
        ],
      });
    }
  }

  return violations;
};
