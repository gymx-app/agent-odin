import { z } from 'zod';

const injurySchema = z.object({
  area: z.string().trim().min(1),
  severity: z.enum(['avoid', 'modify']),
  notes: z.string(),
});

const inBodySchema = z.object({
  body_fat_pct: z.number().nonnegative(),
  smm_kg: z.number().nonnegative(),
  visceral_fat_area: z.number().nonnegative(),
  bmr: z.number().positive(),
  segmental_balance: z.object({
    left_arm: z.number(),
    right_arm: z.number(),
    left_leg: z.number(),
    right_leg: z.number(),
    trunk: z.number(),
  }),
});

const trainingHistorySchema = z
  .object({
    years_consistent_training: z.number().min(0).max(80).optional(),
    consistency_last_12_weeks: z.enum(['low', 'moderate', 'high']).optional(),
    current_sessions_per_week: z.number().int().min(0).max(14).optional(),
    exercise_competency: z.enum(['novice', 'competent', 'advanced']).optional(),
  })
  .optional();

const nutritionSchema = z
  .object({
    calorie_status: z
      .enum(['deficit', 'maintenance', 'surplus', 'unknown'])
      .optional(),
    estimated_protein_g_per_day: z.number().min(0).max(1000).optional(),
  })
  .optional();

const lifestyleSchema = z
  .object({
    sleep_hours: z.number().min(0).max(24).optional(),
    perceived_stress: z.number().int().min(1).max(10).optional(),
    occupation_type: z
      .enum(['sedentary', 'mixed', 'active', 'manual'])
      .optional(),
  })
  .optional();

const sportSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    sessions_per_week: z.number().int().min(0).max(14).optional(),
    intensity: z.enum(['low', 'moderate', 'high']).optional(),
    priority: z.enum(['supporting', 'equal', 'primary']).optional(),
    lower_body_load: z.enum(['low', 'moderate', 'high']).optional(),
  })
  .optional();

const scheduleSchema = z
  .object({
    available_days: z
      .array(
        z.enum([
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ]),
      )
      .optional(),
    preferred_workout_time: z.string().trim().min(1).max(100).optional(),
  })
  .optional();

export const athleteInputSchema = z.object({
  name: z.string().trim().min(1),
  age: z.number().int().min(16).max(100),
  sex: z.enum(['male', 'female']),
  current_weight_kg: z.number().positive(),
  target_weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  goal: z.enum([
    'fat_loss',
    'muscle_gain',
    'recomposition',
    'strength',
    'endurance',
  ]),
  available_days_per_week: z.number().int().min(2).max(7),
  session_duration_min: z.number().int().min(20).max(180),
  equipment: z.enum([
    'full_gym',
    'dumbbells_only',
    'bodyweight',
    'home_gym',
  ]),
  fitness_level: z.enum(['beginner', 'intermediate', 'advanced']),
  injuries: z.array(injurySchema),
  inbody: inBodySchema.nullable(),
  training_history: trainingHistorySchema,
  nutrition: nutritionSchema,
  lifestyle: lifestyleSchema,
  sport: sportSchema,
  schedule: scheduleSchema,
});
