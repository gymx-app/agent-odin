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
  if (candidate) return candidate;

  if (!slot.required) return null;

  // Retry with relaxed difficulty (allow one tier above athlete level)
  const relaxed = buildExerciseCandidatesV2(input, slot, selectedIds, {
    relaxDifficulty: true,
  })[0];
  if (relaxed) return relaxed;

  // Last resort: treat as optional rather than crashing the entire programme
  return null;
};
