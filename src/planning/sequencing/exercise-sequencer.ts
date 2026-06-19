import { PlannerError } from '../planner-errors.js';
import { buildSequenceCandidates } from './sequence-candidate-builder.js';
import { evaluateSequenceConstraints } from './sequence-constraint-evaluator.js';
import {
  countEquipmentTransitions,
  scoreSequenceCandidate,
} from './sequence-scorer.js';
import type {
  ExerciseSequencingInput,
  ExerciseSequencingResult,
  SequenceCandidate,
  SequenceException,
} from './sequencing.types.js';

const rationaleFor = (
  exercise: SequenceCandidate['prescriptions'][number],
  index: number,
  transitionOptimized: boolean,
): string[] => {
  const codes: string[] = [];
  if (exercise.sequence_role === 'power' && index === 0) {
    codes.push('POWER_EXERCISE_PLACED_FIRST');
  }
  if (exercise.sequence_role === 'primary' && index <= 1) {
    codes.push('PRIMARY_EXERCISE_PRIORITY_PRESERVED');
  }
  if (['accessory', 'secondary'].includes(exercise.sequence_role)) {
    codes.push('ACCESSORY_PLACED_AFTER_COMPOUNDS');
  }
  if (exercise.sequence_role === 'isolation') {
    codes.push('ISOLATION_PLACED_LATE');
  }
  if (exercise.sequence_role === 'core') {
    codes.push('CORE_FATIGUE_CONFLICT_AVOIDED');
  }
  if (transitionOptimized) codes.push('EQUIPMENT_TRANSITION_OPTIMIZED');
  return codes;
};

const exceptionDetails = (candidate: SequenceCandidate): SequenceException[] =>
  candidate.exception_codes.map((code) => ({
    code,
    severity: 'warning',
    affected_exercise_ids: candidate.prescriptions.map(
      (exercise) => exercise.exercise_id,
    ),
    reason:
      code === 'PRIORITY_ISOLATION_ADVANCED'
        ? 'A supported specialisation priority advanced a low-systemic isolation exercise.'
        : code === 'PRE_EXHAUST_STRATEGY_APPLIED'
          ? 'An explicit advanced pre-exhaust strategy advanced a low-systemic isolation exercise.'
          : 'Equipment grouping was accepted without moving power or primary work.',
  }));

export const sequenceSessionExercises = (
  input: ExerciseSequencingInput,
): ExerciseSequencingResult => {
  const candidates = buildSequenceCandidates(input);
  const evaluated = candidates.map((candidate) => ({
    candidate,
    violations: evaluateSequenceConstraints(input, candidate),
    score: scoreSequenceCandidate(input, candidate),
  }));
  const valid = evaluated.filter(({ violations }) => violations.length === 0);

  if (valid.length === 0) {
    throw new PlannerError(
      'SESSION_SEQUENCE_UNSATISFIABLE',
      'No deterministic exercise sequence satisfies the hard constraints.',
      {
        rejected_candidates: evaluated.map(({ candidate, violations }) => ({
          candidate_id: candidate.candidate_id,
          violations,
        })),
      },
    );
  }

  valid.sort(
    (left, right) =>
      right.score.total - left.score.total ||
      left.candidate.exception_codes.length -
        right.candidate.exception_codes.length ||
      left.score.primary_position - right.score.primary_position ||
      left.score.fatigue_penalty - right.score.fatigue_penalty ||
      left.score.equipment_transitions - right.score.equipment_transitions ||
      left.score.ordering_changes - right.score.ordering_changes ||
      left.candidate.candidate_id.localeCompare(right.candidate.candidate_id),
  );
  const selected = valid[0]!;
  const optimized =
    selected.candidate.candidate_id === 'protected-equipment-grouping';
  const exercises = selected.candidate.prescriptions.map((exercise, index) => ({
    ...exercise,
    display_order: index + 1,
    sequencing_rationale: [
      ...new Set([
        ...exercise.sequencing_rationale,
        ...rationaleFor(exercise, index, optimized),
      ]),
    ],
  }));

  return {
    exercises,
    selected_candidate_id: selected.candidate.candidate_id,
    sequence_exceptions: exceptionDetails(selected.candidate),
    rejected_candidates: evaluated
      .filter(({ violations }) => violations.length > 0)
      .map(({ candidate, violations }) => ({
        candidate_id: candidate.candidate_id,
        violations,
      })),
    transition_count: countEquipmentTransitions(selected.candidate),
    rationale_codes: [
      ...new Set(
        exercises.flatMap((exercise) => exercise.sequencing_rationale),
      ),
    ],
  };
};
