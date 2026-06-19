import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { FilledMovementSlot, MovementSlot } from './planning.types.js';
import { evaluateExerciseEligibility } from '../exercises/eligibility.js';
import { matchExerciseEquipment } from '../exercises/equipment-matching.js';
import { PlannerError } from './planner-errors.js';

const difficultyRank: Record<Exercise['difficulty'], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const maxDifficultyForProfile = (
  profile: NormalizedAthleteProfile,
): Exercise['difficulty'] =>
  profile.source.fitness_level === 'advanced'
    ? 'advanced'
    : profile.source.fitness_level === 'intermediate'
      ? 'intermediate'
      : 'beginner';

const isDifficultyCompatible = (
  profile: NormalizedAthleteProfile,
  exercise: Exercise,
): boolean => {
  if (profile.source.fitness_level === 'beginner') {
    return (
      exercise.difficulty === 'beginner' ||
      (exercise.difficulty === 'intermediate' && exercise.skill_demand <= 2)
    );
  }

  return (
    difficultyRank[exercise.difficulty] <=
    difficultyRank[maxDifficultyForProfile(profile)]
  );
};

const sortExerciseCandidates = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
  left: { exercise: Exercise; status: 'eligible' | 'modifiable' },
  right: { exercise: Exercise; status: 'eligible' | 'modifiable' },
): number => {
  const statusRank = { eligible: 0, modifiable: 1 };
  const exactPatternRank = (exercise: Exercise): number =>
    exercise.movement_patterns.includes(slot.movement_pattern) ? 0 : 1;

  return (
    statusRank[left.status] - statusRank[right.status] ||
    exactPatternRank(left.exercise) - exactPatternRank(right.exercise) ||
    difficultyRank[left.exercise.difficulty] -
      difficultyRank[right.exercise.difficulty] ||
    (profile.recovery_capacity === 'low'
      ? left.exercise.fatigue_cost.systemic -
          right.exercise.fatigue_cost.systemic ||
        left.exercise.fatigue_cost.axial - right.exercise.fatigue_cost.axial
      : 0) ||
    left.exercise.skill_demand - right.exercise.skill_demand ||
    left.exercise.name.localeCompare(right.exercise.name)
  );
};

const candidatePatternsForSlot = (slot: MovementSlot) => [
  slot.movement_pattern,
  ...slot.allowed_substitution_patterns,
];

export const fillMovementSlot = (
  slot: MovementSlot,
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  recentlySelectedExerciseIds: string[] = [],
): FilledMovementSlot => {
  const candidatePatterns = candidatePatternsForSlot(slot);
  const candidates = exercises
    .map((exercise) => {
      const eligibility = evaluateExerciseEligibility(exercise, profile);

      return {
        exercise,
        eligibility,
      };
    })
    .filter(({ exercise, eligibility }) => {
      if (eligibility.status === 'excluded') {
        return false;
      }

      if (
        !exercise.movement_patterns.some((pattern) =>
          candidatePatterns.includes(pattern),
        )
      ) {
        return false;
      }

      if (
        !matchExerciseEquipment(exercise, profile.source.equipment).compatible
      ) {
        return false;
      }

      if (!isDifficultyCompatible(profile, exercise)) {
        return false;
      }

      return true;
    })
    .map(({ exercise, eligibility }) => ({
      exercise,
      status: eligibility.status as 'eligible' | 'modifiable',
      warnings: eligibility.warnings,
    }))
    .sort((left, right) => {
      const recentPenalty =
        Number(recentlySelectedExerciseIds.includes(left.exercise.id)) -
        Number(recentlySelectedExerciseIds.includes(right.exercise.id));

      return (
        recentPenalty || sortExerciseCandidates(profile, slot, left, right)
      );
    });

  const selectedCandidate = candidates[0];

  if (!selectedCandidate) {
    throw new PlannerError(
      'NO_ELIGIBLE_EXERCISE',
      `No eligible exercise found for ${slot.movement_pattern}.`,
      { slot },
    );
  }

  if (slot.required && selectedCandidate.status === 'modifiable') {
    return {
      slot,
      exercise: selectedCandidate.exercise,
      status: 'modifiable',
      warnings: [
        ...selectedCandidate.warnings,
        `Selected as modifiable fallback for required ${slot.movement_pattern} slot.`,
      ],
    };
  }

  return {
    slot,
    exercise: selectedCandidate.exercise,
    status: selectedCandidate.status,
    warnings: selectedCandidate.warnings,
  };
};
