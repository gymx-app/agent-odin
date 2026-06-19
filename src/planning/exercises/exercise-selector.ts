import { PlannerError } from '../planner-errors.js';
import type {
  ExerciseCandidate,
  MovementSlotV2,
  ResistanceSessionBuilderInput,
} from '../sessions/session.types.js';
import { buildExerciseCandidatesV2 } from './exercise-candidate-builder.js';

export const selectExerciseForSlot = (
  input: ResistanceSessionBuilderInput,
  slot: MovementSlotV2,
  selectedIds: Set<string>,
): ExerciseCandidate | null => {
  const candidate = buildExerciseCandidatesV2(input, slot, selectedIds)[0];
  if (!candidate && slot.required) {
    throw new PlannerError(
      'NO_ELIGIBLE_EXERCISE_FOR_REQUIRED_SLOT',
      `No approved eligible or modifiable exercise exists for ${slot.slot_id}.`,
      { slot },
    );
  }
  return candidate ?? null;
};
