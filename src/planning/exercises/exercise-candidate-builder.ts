import { evaluateExerciseEligibility } from '../../exercises/eligibility.js';
import { matchExerciseEquipment } from '../../exercises/equipment-matching.js';
import type {
  ExerciseCandidate,
  MovementSlotV2,
  ResistanceSessionBuilderInput,
} from '../sessions/session.types.js';

const difficultyRank = { beginner: 1, intermediate: 2, advanced: 3 };
const level = { low: 2, moderate: 3, high: 5 };

export const buildExerciseCandidatesV2 = (
  input: ResistanceSessionBuilderInput,
  slot: MovementSlotV2,
  selectedIds: Set<string>,
): ExerciseCandidate[] => {
  const patterns = [
    slot.movement_pattern,
    ...slot.allowed_substitution_patterns,
  ];
  const priorId = input.prior_programme_context?.by_slot_id[slot.slot_id];
  const maxDifficulty =
    input.profile.athlete_state.training_status.value === 'advanced'
      ? 3
      : input.profile.athlete_state.training_status.value === 'intermediate'
        ? 2
        : 1;

  return input.exercises
    .flatMap((exercise) => {
      const eligibility = evaluateExerciseEligibility(exercise, input.profile);
      if (eligibility.status === 'excluded') return [];
      if (
        !exercise.movement_patterns.some((pattern) =>
          patterns.includes(pattern),
        )
      ) {
        return [];
      }
      if (
        !matchExerciseEquipment(exercise, input.profile.source.equipment)
          .compatible ||
        difficultyRank[exercise.difficulty] > maxDifficulty ||
        selectedIds.has(exercise.id)
      ) {
        return [];
      }
      const exact = exercise.movement_patterns.includes(slot.movement_pattern);
      const targetMatch = exercise.primary_muscles.filter((muscle) =>
        slot.target_muscle_groups.includes(muscle),
      ).length;
      const fatigueFit =
        exercise.fatigue_cost.systemic <= level[slot.fatigue_budget.systemic] &&
        exercise.fatigue_cost.grip <= level[slot.fatigue_budget.grip] &&
        exercise.fatigue_cost.axial <= level[slot.fatigue_budget.lower_back];
      const continuity = priorId === exercise.id;
      const score =
        (eligibility.status === 'eligible' ? 100 : 70) +
        (exact ? 30 : 10) +
        targetMatch * 10 +
        (fatigueFit ? 10 : -20) +
        (continuity ? 15 : 0) +
        (6 - exercise.skill_demand) +
        (6 - exercise.stability_demand);

      return [
        {
          exercise,
          status: eligibility.status as 'eligible' | 'modifiable',
          warnings: eligibility.warnings,
          restriction_tags: eligibility.conflicts.map(
            (conflict) => conflict.restriction_tag,
          ),
          score,
          rationale_codes: [
            exact
              ? 'EXACT_PATTERN_EXERCISE_SELECTED'
              : 'MOVEMENT_RESTRICTION_SLOT_REPLACED',
            ...(eligibility.status === 'modifiable'
              ? ['MODIFIABLE_EXERCISE_SELECTED']
              : []),
            ...(continuity ? ['EXERCISE_CONTINUITY_PRESERVED'] : []),
            ...(fatigueFit ? ['LOW_FATIGUE_EXERCISE_SELECTED'] : []),
            'PROGRESSION_COMPATIBLE_EXERCISE_SELECTED',
          ],
        },
      ];
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.exercise.id.localeCompare(right.exercise.id),
    );
};
