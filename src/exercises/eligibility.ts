import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { MovementDemandTag } from '../domain/exercise/exercise-taxonomy.js';

export type ExerciseEligibilityStatus = 'eligible' | 'modifiable' | 'excluded';

export type ExerciseEligibilityConflict = {
  code: string;
  restriction_tag: MovementDemandTag;
  restriction_severity: 'modify' | 'avoid';
  movement_demand_score: number;
  message: string;
};

export type ExerciseEligibilityResult = {
  status: ExerciseEligibilityStatus;
  eligible: boolean;
  conflicts: ExerciseEligibilityConflict[];
  warnings: string[];
};

export const evaluateExerciseEligibility = (
  exercise: Exercise,
  normalizedProfile: NormalizedAthleteProfile,
): ExerciseEligibilityResult => {
  const warnings: string[] = [];
  const conflicts = normalizedProfile.movement_restrictions.flatMap(
    (restriction) => {
      const movementDemandScore = exercise.movement_demands[restriction.tag];

      if (movementDemandScore <= 0) {
        return [];
      }

      return [
        {
          code:
            restriction.severity === 'avoid'
              ? 'AVOID_RESTRICTION_CONFLICT'
              : 'MODIFY_RESTRICTION_CONFLICT',
          restriction_tag: restriction.tag,
          restriction_severity: restriction.severity,
          movement_demand_score: movementDemandScore,
          message: `${exercise.name} has ${restriction.tag} demand score ${movementDemandScore} with a ${restriction.severity} restriction.`,
        },
      ];
    },
  );

  if (normalizedProfile.excluded_exercise_ids.includes(exercise.id)) {
    return {
      status: 'excluded',
      eligible: false,
      conflicts: [
        ...conflicts,
        {
          code: 'EXPLICITLY_EXCLUDED_EXERCISE',
          restriction_tag: 'high_impact',
          restriction_severity: 'avoid',
          movement_demand_score: 0,
          message: `${exercise.name} is explicitly excluded for this athlete.`,
        },
      ],
      warnings,
    };
  }

  if (exercise.status === 'deprecated') {
    return {
      status: 'excluded',
      eligible: false,
      conflicts,
      warnings: [`${exercise.name} is deprecated.`],
    };
  }

  if (conflicts.some((conflict) => conflict.restriction_severity === 'avoid')) {
    return {
      status: 'excluded',
      eligible: false,
      conflicts,
      warnings,
    };
  }

  if (exercise.status === 'experimental') {
    warnings.push(`${exercise.name} is experimental.`);
  }

  if (conflicts.length > 0 || exercise.status === 'experimental') {
    return {
      status: 'modifiable',
      eligible: true,
      conflicts,
      warnings,
    };
  }

  return {
    status: 'eligible',
    eligible: true,
    conflicts,
    warnings,
  };
};
