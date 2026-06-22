import { evaluateExerciseEligibility } from '../../exercises/eligibility.js';
import { matchExerciseEquipment } from '../../exercises/equipment-matching.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type {
  ExerciseCandidate,
  MovementSlotV2,
  ResistanceSessionBuilderInput,
} from '../sessions/session.types.js';
import { EQUIPMENT_PREFERENCE } from '../evidence.js';

const difficultyRank = { beginner: 1, intermediate: 2, advanced: 3 };
const level = { low: 2, moderate: 3, high: 5 };

const loadedEquipment = new Set([
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'smith_machine',
  'kettlebell',
]);

const equipmentPreferenceBonus = (
  athleteEquipment: string,
  exerciseEquipment: string[],
): number => {
  if (athleteEquipment === 'bodyweight') return 0;
  const usesLoaded = exerciseEquipment.some((e) => loadedEquipment.has(e));
  const isBodyweightOnly =
    exerciseEquipment.length === 1 && exerciseEquipment[0] === 'bodyweight';
  if (usesLoaded) return EQUIPMENT_PREFERENCE.loaded_bonus;
  if (isBodyweightOnly) return EQUIPMENT_PREFERENCE.bodyweight_penalty;
  return 0;
};

const goalBonus = (primaryObjective: string, exercise: Exercise): number => {
  switch (primaryObjective) {
    case 'strength':
      return (
        (exercise.exercise_type === 'compound' ? 15 : 0) +
        (exercise.laterality === 'bilateral' ? 5 : 0) +
        (exercise.fatigue_cost.systemic >= 3 ? 5 : 0)
      );
    case 'muscle_gain':
      return (
        (exercise.fatigue_cost.local >= 3 ? 10 : 0) +
        (exercise.stability_demand <= 3 ? 5 : 0) +
        (exercise.exercise_type === 'isolation' ? 5 : 0)
      );
    case 'fat_loss':
      return (
        (exercise.exercise_type === 'compound' ? 10 : 0) +
        (exercise.fatigue_cost.systemic >= 3 ? 5 : 0)
      );
    case 'endurance':
      return (
        (exercise.fatigue_cost.systemic <= 2 ? 10 : 0) +
        (exercise.fatigue_cost.grip <= 2 ? 5 : 0)
      );
    case 'recomposition':
      return (
        (exercise.exercise_type === 'compound' ? 8 : 0) +
        (exercise.fatigue_cost.local >= 3 ? 5 : 0)
      );
    default:
      return 0;
  }
};

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
      const goalBonusScore = goalBonus(
        input.strategy.primary_objective,
        exercise,
      );
      const equipBonus = equipmentPreferenceBonus(
        input.profile.source.equipment,
        exercise.equipment,
      );
      const score =
        (eligibility.status === 'eligible' ? 100 : 70) +
        (exact ? 30 : 10) +
        targetMatch * 10 +
        (fatigueFit ? 10 : -20) +
        (continuity ? 15 : 0) +
        (6 - exercise.skill_demand) +
        (6 - exercise.stability_demand) +
        goalBonusScore +
        equipBonus;

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
            ...(goalBonusScore > 0 ? ['GOAL_PREFERENCE_APPLIED'] : []),
            ...(equipBonus > 0 ? ['LOADED_EQUIPMENT_PREFERRED'] : []),
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
