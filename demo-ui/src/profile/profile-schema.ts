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
});
