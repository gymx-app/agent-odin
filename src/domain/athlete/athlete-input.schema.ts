import { z } from 'zod';
import {
  AthleteGoalSchema,
  EquipmentAvailabilitySchema,
  FitnessLevelSchema,
  SexSchema,
} from '../shared/domain-enums.js';

const InjurySchema = z.object({
  area: z.string().trim().min(1),
  severity: z.enum(['avoid', 'modify']),
  notes: z.string(),
});

const SegmentalBalanceSchema = z.object({
  left_arm: z.number(),
  right_arm: z.number(),
  left_leg: z.number(),
  right_leg: z.number(),
  trunk: z.number(),
});

const InBodySchema = z.object({
  body_fat_pct: z.number().nonnegative(),
  smm_kg: z.number().nonnegative(),
  visceral_fat_area: z.number().nonnegative(),
  bmr: z.number().positive(),
  segmental_balance: SegmentalBalanceSchema,
});

export const AthleteInputSchema = z.object({
  name: z.string().trim().min(1),
  age: z.number().int().min(16).max(100),
  sex: SexSchema,
  current_weight_kg: z.number().positive(),
  target_weight_kg: z.number().positive(),
  height_cm: z.number().positive(),
  goal: AthleteGoalSchema,
  available_days_per_week: z.number().int().min(2).max(7),
  session_duration_min: z.number().int().min(20).max(180),
  equipment: EquipmentAvailabilitySchema,
  fitness_level: FitnessLevelSchema,
  injuries: z.array(InjurySchema),
  inbody: InBodySchema.nullable(),
});
