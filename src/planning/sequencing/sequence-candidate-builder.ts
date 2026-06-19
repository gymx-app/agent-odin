import { SEQUENCE_ROLE_RANK } from './sequence-policies.js';
import type {
  ExerciseSequencingInput,
  SequenceCandidate,
} from './sequencing.types.js';

const stable = <T extends { exercise_id: string }>(
  items: T[],
  compare: (left: T, right: T) => number,
): T[] =>
  [...items].sort(
    (left, right) =>
      compare(left, right) || left.exercise_id.localeCompare(right.exercise_id),
  );

export const buildSequenceCandidates = (
  input: ExerciseSequencingInput,
): SequenceCandidate[] => {
  const source = input.session.day.exercises;
  const metadata = new Map(
    input.exercises.map((exercise) => [exercise.id, exercise]),
  );
  const strict = stable(
    source,
    (left, right) =>
      SEQUENCE_ROLE_RANK[left.sequence_role] -
        SEQUENCE_ROLE_RANK[right.sequence_role] ||
      left.priority - right.priority,
  );
  const technical = stable(
    source,
    (left, right) =>
      SEQUENCE_ROLE_RANK[left.sequence_role] -
        SEQUENCE_ROLE_RANK[right.sequence_role] ||
      (metadata.get(right.exercise_id)?.skill_demand ?? 0) -
        (metadata.get(left.exercise_id)?.skill_demand ?? 0) ||
      (metadata.get(right.exercise_id)?.stability_demand ?? 0) -
        (metadata.get(left.exercise_id)?.stability_demand ?? 0) ||
      left.priority - right.priority,
  );
  const protectedCount = strict.filter((exercise) =>
    ['power', 'primary'].includes(exercise.sequence_role),
  ).length;
  const protectedExercises = strict.slice(0, protectedCount);
  const groupedRemainder = stable(
    strict.slice(protectedCount),
    (left, right) =>
      left.equipment.join('|').localeCompare(right.equipment.join('|')) ||
      SEQUENCE_ROLE_RANK[left.sequence_role] -
        SEQUENCE_ROLE_RANK[right.sequence_role] ||
      left.priority - right.priority,
  );
  const candidates: SequenceCandidate[] = [
    {
      candidate_id: 'strict-priority',
      prescriptions: strict,
      exception_codes: [],
    },
    {
      candidate_id: 'technical-priority',
      prescriptions: technical,
      exception_codes: [],
    },
    {
      candidate_id: 'protected-equipment-grouping',
      prescriptions: [...protectedExercises, ...groupedRemainder],
      exception_codes: ['EQUIPMENT_GROUPING_ACCEPTED'],
    },
  ];

  const specializationSupported =
    input.session.day.session_metadata?.session_kind === 'specialized' ||
    input.session.day.session_metadata?.phase_objective
      .toLowerCase()
      .includes('special');
  const priorityIsolation = strict.find(
    (exercise) =>
      exercise.sequence_role === 'isolation' &&
      exercise.priority <= 2 &&
      (metadata.get(exercise.exercise_id)?.skill_demand ?? 5) <= 2 &&
      (metadata.get(exercise.exercise_id)?.fatigue_cost.systemic ?? 5) <= 2,
  );
  if (specializationSupported && priorityIsolation) {
    candidates.push({
      candidate_id: 'specialisation-first',
      prescriptions: [
        priorityIsolation,
        ...strict.filter(
          (exercise) => exercise.exercise_id !== priorityIsolation.exercise_id,
        ),
      ],
      exception_codes: ['PRIORITY_ISOLATION_ADVANCED'],
    });
  }

  const preExhaustSupported =
    ['intermediate', 'advanced'].includes(
      input.profile.athlete_state.training_status.value,
    ) &&
    input.session.strategy?.rationale.some((decision) =>
      ['PRE_EXHAUST_SELECTED', 'PRE_EXHAUST_STRATEGY_APPLIED'].includes(
        decision.code,
      ),
    ) === true &&
    /hypertrophy|special/i.test(
      input.session.day.session_metadata?.phase_objective ?? '',
    );
  if (preExhaustSupported && priorityIsolation) {
    candidates.push({
      candidate_id: 'explicit-pre-exhaust',
      prescriptions: [
        priorityIsolation,
        ...strict.filter(
          (exercise) => exercise.exercise_id !== priorityIsolation.exercise_id,
        ),
      ],
      exception_codes: ['PRE_EXHAUST_STRATEGY_APPLIED'],
    });
  }

  return candidates;
};
