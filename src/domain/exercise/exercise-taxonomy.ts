import { z } from 'zod';

export const MovementPatternSchema = z.enum([
  'squat',
  'hinge',
  'horizontal_push',
  'vertical_push',
  'horizontal_pull',
  'vertical_pull',
  'knee_flexion_isolation',
  'knee_extension_isolation',
  'elbow_flexion',
  'elbow_extension',
  'shoulder_abduction',
  'calf_raise',
  'carry',
  'core_anti_extension',
  'core_anti_rotation',
  'core_flexion',
  'core_extension',
  'liss',
  'mobility',
]);

export const MuscleGroupSchema = z.enum([
  'chest',
  'lats',
  'upper_back',
  'front_delts',
  'side_delts',
  'rear_delts',
  'biceps',
  'triceps',
  'forearms',
  'quadriceps',
  'hamstrings',
  'glutes',
  'adductors',
  'calves',
  'spinal_erectors',
  'abdominals',
  'obliques',
]);

export const ExerciseEquipmentSchema = z.enum([
  'bodyweight',
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'smith_machine',
  'bench',
  'rack',
  'pullup_bar',
  'resistance_band',
  'treadmill',
  'bike',
  'rower',
  'elliptical',
]);

export const MovementDemandTagSchema = z.enum([
  'loaded_deep_knee_flexion',
  'high_impact',
  'single_leg_loading',
  'high_spinal_compression',
  'loaded_spinal_flexion',
  'unsupported_hip_hinge',
  'overhead_loading',
  'deep_shoulder_extension',
  'high_abduction_loading',
  'high_wrist_extension',
  'fixed_pronated_grip',
  'high_elbow_flexion_load',
  'high_elbow_extension_load',
  'deep_ankle_dorsiflexion',
]);

export const MOVEMENT_PATTERNS = MovementPatternSchema.options;
export const MUSCLE_GROUPS = MuscleGroupSchema.options;
export const EXERCISE_EQUIPMENT = ExerciseEquipmentSchema.options;
export const MOVEMENT_DEMAND_TAGS = MovementDemandTagSchema.options;

export type MovementPattern = z.infer<typeof MovementPatternSchema>;
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
export type ExerciseEquipment = z.infer<typeof ExerciseEquipmentSchema>;
export type MovementDemandTag = z.infer<typeof MovementDemandTagSchema>;
