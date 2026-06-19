import { findExerciseSubstitutions } from '../../exercises/substitutions.js';
import type {
  ExerciseCandidate,
  MovementSlotV2,
  ResistanceSessionBuilderInput,
} from '../sessions/session.types.js';

export const buildSubstitutionOptions = (
  input: ResistanceSessionBuilderInput,
  slot: MovementSlotV2,
  selected: ExerciseCandidate,
): {
  substitution_group_id?: string;
  substitution_options: {
    approved_exercise_ids: string[];
    preserve: 'movement_pattern';
  };
} => {
  const approved = findExerciseSubstitutions(
    selected.exercise,
    input.exercises,
    input.profile,
  )
    .filter(({ exercise }) =>
      exercise.movement_patterns.some(
        (pattern) =>
          pattern === slot.movement_pattern ||
          slot.allowed_substitution_patterns.includes(pattern),
      ),
    )
    .slice(0, 3)
    .map(({ exercise }) => exercise.id);

  return {
    ...(selected.exercise.substitution_group
      ? {
          substitution_group_id: `sub-${selected.exercise.substitution_group}`,
        }
      : {}),
    substitution_options: {
      approved_exercise_ids: approved,
      preserve: 'movement_pattern',
    },
  };
};
