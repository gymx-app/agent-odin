import { z } from 'zod';
import { AthleteInputBaseSchema } from './athlete-input.schema.js';

const InBodyV2Schema = z.object({
  body_fat_pct: z.number().nonnegative(),
  smm_kg: z.number().nonnegative(),
  visceral_fat_area: z.number().nonnegative(),
  bmr: z.number().positive(),
  segmental_balance: z
    .object({
      left_arm: z.number(),
      right_arm: z.number(),
      left_leg: z.number(),
      right_leg: z.number(),
      trunk: z.number(),
    })
    .optional(),
});

export const GoalParametersV2Schema = z.object({
  current_body_fat_pct: z.number().min(0).max(100).optional(),
  target_body_fat_pct: z.number().min(0).max(100).optional(),
  target_muscle_gain_kg: z.number().min(0).max(50).optional(),
  timeframe_weeks: z.number().int().min(4).max(52).optional(),
  primary_lift: z
    .enum(['squat', 'deadlift', 'bench_press', 'overhead_press'])
    .optional(),
  current_1rm_kg: z.number().positive().optional(),
  target_1rm_kg: z.number().positive().optional(),
  endurance_focus: z.enum(['cardio', 'mobility', 'general']).optional(),
});

export const AthleteInputV2Schema = AthleteInputBaseSchema.omit({ inbody: true }).extend({
  inbody: InBodyV2Schema.nullable().default(null),
  goal_parameters: GoalParametersV2Schema.optional(),
});

export type AthleteInputV2 = z.infer<typeof AthleteInputV2Schema>;
export type GoalParametersV2 = z.infer<typeof GoalParametersV2Schema>;
