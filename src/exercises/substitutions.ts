import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { filterEligibleExercises } from './filtering.js';

export type ExerciseSubstitution = {
  exercise: Exercise;
  reasons: string[];
  score: number;
};

const sharedValues = <Value>(left: Value[], right: Value[]): Value[] =>
  left.filter((value) => right.includes(value));

// Scores + explains why `candidate` matches `sourceExercise` as a
// substitute. Extracted so callers that already have a specific candidate
// in hand (e.g. a prescription's precomputed substitution_options) can get
// the same "why it matched" text that findExerciseSubstitutions produces,
// without re-running the eligibility/equipment search below.
export const describeSubstitutionMatch = (
  sourceExercise: Exercise,
  candidate: Exercise,
): Pick<ExerciseSubstitution, 'reasons' | 'score'> => {
  const reasons: string[] = [];
  let score = 0;

  if (
    sourceExercise.substitution_group &&
    candidate.substitution_group === sourceExercise.substitution_group
  ) {
    score += 4;
    reasons.push('same substitution group');
  }

  const sharedPatterns = sharedValues(
    candidate.movement_patterns,
    sourceExercise.movement_patterns,
  );

  score += sharedPatterns.length * 2;
  reasons.push(`shared movement pattern: ${sharedPatterns.join(', ')}`);

  const sharedPrimaryMuscles = sharedValues(
    candidate.primary_muscles,
    sourceExercise.primary_muscles,
  );

  if (sharedPrimaryMuscles.length > 0) {
    score += 2;
    reasons.push(`shared primary muscle: ${sharedPrimaryMuscles.join(', ')}`);
  }

  return { reasons, score };
};

export const findExerciseSubstitutions = (
  sourceExercise: Exercise,
  exercises: Exercise[],
  normalizedProfile: NormalizedAthleteProfile,
): ExerciseSubstitution[] =>
  filterEligibleExercises(exercises, normalizedProfile, {
    includeModifiable: false,
    requireEquipmentCompatibility: true,
  })
    .filter(({ exercise }) => exercise.id !== sourceExercise.id)
    .filter(
      ({ exercise }) =>
        sharedValues(
          exercise.movement_patterns,
          sourceExercise.movement_patterns,
        ).length > 0,
    )
    .map(({ exercise }) => ({
      exercise,
      ...describeSubstitutionMatch(sourceExercise, exercise),
    }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.exercise.name.localeCompare(right.exercise.name),
    );
