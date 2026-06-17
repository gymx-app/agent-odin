import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type {
  MovementPattern,
  MuscleGroup,
} from '../domain/exercise/exercise-taxonomy.js';
import { matchExerciseEquipment } from './equipment-matching.js';
import {
  evaluateExerciseEligibility,
  type ExerciseEligibilityResult,
} from './eligibility.js';

export type ExerciseFilters = {
  movementPattern?: MovementPattern;
  primaryMuscle?: MuscleGroup;
  maximumDifficulty?: Exercise['difficulty'];
  requireEquipmentCompatibility?: boolean;
  includeModifiable?: boolean;
  substitutionGroup?: string;
};

export type FilteredExercise = {
  exercise: Exercise;
  eligibility: ExerciseEligibilityResult;
};

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const statusRank = (status: ExerciseEligibilityResult['status']): number =>
  status === 'eligible' ? 0 : status === 'modifiable' ? 1 : 2;

export const sortFilteredExercises = (
  left: FilteredExercise,
  right: FilteredExercise,
): number =>
  statusRank(left.eligibility.status) - statusRank(right.eligibility.status) ||
  difficultyRank[left.exercise.difficulty] -
    difficultyRank[right.exercise.difficulty] ||
  left.exercise.fatigue_cost.systemic - right.exercise.fatigue_cost.systemic ||
  left.exercise.fatigue_cost.axial - right.exercise.fatigue_cost.axial ||
  left.exercise.name.localeCompare(right.exercise.name);

export const filterEligibleExercises = (
  exercises: Exercise[],
  normalizedProfile: NormalizedAthleteProfile,
  filters: ExerciseFilters = {},
): FilteredExercise[] => {
  const includeModifiable = filters.includeModifiable ?? true;
  const requireEquipmentCompatibility =
    filters.requireEquipmentCompatibility ?? true;

  return exercises
    .map((exercise) => ({
      exercise,
      eligibility: evaluateExerciseEligibility(exercise, normalizedProfile),
    }))
    .filter(({ exercise, eligibility }) => {
      if (eligibility.status === 'excluded') {
        return false;
      }

      if (!includeModifiable && eligibility.status === 'modifiable') {
        return false;
      }

      if (
        filters.movementPattern &&
        !exercise.movement_patterns.includes(filters.movementPattern)
      ) {
        return false;
      }

      if (
        filters.primaryMuscle &&
        !exercise.primary_muscles.includes(filters.primaryMuscle)
      ) {
        return false;
      }

      if (
        filters.maximumDifficulty &&
        difficultyRank[exercise.difficulty] >
          difficultyRank[filters.maximumDifficulty]
      ) {
        return false;
      }

      if (
        filters.substitutionGroup &&
        exercise.substitution_group !== filters.substitutionGroup
      ) {
        return false;
      }

      if (
        requireEquipmentCompatibility &&
        !matchExerciseEquipment(exercise, normalizedProfile.source.equipment)
          .compatible
      ) {
        return false;
      }

      return true;
    })
    .sort(sortFilteredExercises);
};
