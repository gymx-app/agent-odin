import type { ExercisePrescription } from '../sessions/session.types.js';

export const SEQUENCE_SCORE_WEIGHTS = {
  priority_preservation: 25,
  power_preservation: 15,
  technical_quality: 15,
  fatigue_interference: 25,
  equipment_efficiency: 10,
  duration_efficiency: 10,
} as const;

export const SEQUENCE_ROLE_RANK: Record<
  ExercisePrescription['sequence_role'],
  number
> = {
  power: 0,
  primary: 1,
  secondary: 2,
  accessory: 3,
  isolation: 4,
  core: 5,
};

export const isPull = (exercise: ExercisePrescription): boolean =>
  exercise.movement_patterns.some((pattern) =>
    ['horizontal_pull', 'vertical_pull'].includes(pattern),
  );

export const requiresHighTrunkStability = (
  exercise: ExercisePrescription,
): boolean =>
  exercise.movement_patterns.some((pattern) =>
    ['squat', 'hinge', 'horizontal_pull', 'vertical_push'].includes(pattern),
  );
