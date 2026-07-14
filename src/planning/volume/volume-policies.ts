import type {
  MuscleGroup,
  MovementPattern,
} from '../../domain/exercise/exercise-taxonomy.js';

export const CORE_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'lats',
  'upper_back',
  'front_delts',
  'side_delts',
  'biceps',
  'triceps',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'abdominals',
];

export const CORE_MOVEMENT_PATTERNS: MovementPattern[] = [
  'squat',
  'hinge',
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'knee_flexion_isolation',
  'elbow_flexion',
  'elbow_extension',
  'shoulder_abduction',
  'calf_raise',
  'core_anti_extension',
  'core_anti_rotation',
  'hip_abduction',
];

export const MOVEMENT_MUSCLE_MAP: Record<MovementPattern, MuscleGroup[]> = {
  squat: ['quadriceps', 'glutes'],
  hinge: ['hamstrings', 'glutes'],
  horizontal_push: ['chest', 'triceps', 'front_delts'],
  vertical_push: ['front_delts', 'triceps'],
  horizontal_pull: ['upper_back', 'lats', 'biceps'],
  vertical_pull: ['lats', 'biceps'],
  knee_flexion_isolation: ['hamstrings'],
  knee_extension_isolation: ['quadriceps'],
  elbow_flexion: ['biceps'],
  elbow_extension: ['triceps'],
  shoulder_abduction: ['side_delts'],
  calf_raise: ['calves'],
  carry: ['abdominals'],
  core_anti_extension: ['abdominals'],
  core_anti_rotation: ['obliques'],
  core_flexion: ['abdominals'],
  core_extension: ['spinal_erectors'],
  hip_adduction: ['adductors'],
  hip_abduction: ['glutes'],
  liss: [],
  mobility: [],
};

export const BASE_DIRECT_SETS = {
  beginner: 6,
  returning: 5,
  intermediate: 8,
  advanced: 10,
  unknown: 6,
} as const;
