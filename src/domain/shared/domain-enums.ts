import { z } from 'zod';

export const SexSchema = z.enum(['male', 'female', 'other']);
export const AthleteGoalSchema = z.enum([
  'fat_loss',
  'muscle_gain',
  'recomposition',
  'strength',
  'endurance',
  'general_fitness',
]);
// Accepts the PWA's 'bodyweight_only' as an input alias for 'bodyweight' —
// every downstream consumer only ever checks for 'bodyweight'.
export const EquipmentAvailabilitySchema = z
  .enum(['full_gym', 'dumbbells_only', 'bodyweight', 'home_gym', 'hotel_gym', 'bodyweight_only'])
  .transform((value) => (value === 'bodyweight_only' ? 'bodyweight' : value));
export const FitnessLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
]);
export const RecoveryCapacitySchema = z.enum([
  'low',
  'moderate',
  'high',
  'unknown',
]);
export const ProgrammeConfidenceSchema = z.enum(['low', 'medium', 'high']);
export const HealthFlagSeveritySchema = z.enum(['info', 'warning', 'blocking']);
export const ProgressionIntentSchema = z.enum([
  'accumulation',
  'intensification',
  'realisation',
  'deload',
  'maintenance',
]);
export const DayOfWeekSchema = z.enum([
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
]);
export const DerivedStateConfidenceSchema = z.enum(['low', 'moderate', 'high']);
export const WorkoutTypeSchema = z.enum(['workout', 'liss', 'rest']);
export const ValidationWarningSeveritySchema = z.enum([
  'info',
  'warning',
  'error',
]);

export const DAYS_OF_WEEK = DayOfWeekSchema.options;
