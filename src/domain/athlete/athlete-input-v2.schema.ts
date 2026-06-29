import { z } from 'zod';
import { AthleteInputBaseSchema } from './athlete-input.schema.js';

// ── InBody (v2 — segmental_balance optional) ─────────────────────────────────

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

// ── Goal parameters ───────────────────────────────────────────────────────────

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

// ── Strength baselines ────────────────────────────────────────────────────────

export const COMPOUND_EXERCISE_IDS = [
  'squat',
  'bench_press',
  'deadlift',
  'overhead_press',
  'barbell_row',
] as const;

export type CompoundExerciseId = (typeof COMPOUND_EXERCISE_IDS)[number];

const KnownLiftSchema = z.object({
  exercise_id: z.enum(COMPOUND_EXERCISE_IDS, {
    errorMap: () => ({
      message: `exercise_id must be one of: ${COMPOUND_EXERCISE_IDS.join(', ')}`,
    }),
  }),
  weight_kg: z.number().positive(),
  reps: z.number().int().min(1).max(12),
});

export const BaselinePathSchema = z.enum(['self_reported', 'day_one_test', 'skipped']);
export type BaselinePath = z.infer<typeof BaselinePathSchema>;
export type KnownLift = z.infer<typeof KnownLiftSchema>;

// ── v2 athlete input ──────────────────────────────────────────────────────────

export const AthleteInputV2Schema = AthleteInputBaseSchema.omit({ inbody: true })
  .extend({
    inbody: InBodyV2Schema.nullable().default(null),
    goal_parameters: GoalParametersV2Schema.optional(),
    known_lifts: z.array(KnownLiftSchema).nullable().default(null),
    baseline_path: BaselinePathSchema.default('skipped'),
  })
  .superRefine((input, ctx) => {
    const lifts = input.known_lifts ?? [];
    const hasLifts = lifts.length > 0;

    if (hasLifts && input.baseline_path !== 'self_reported') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['baseline_path'],
        message: 'baseline_path must be "self_reported" when known_lifts has entries',
      });
    }

    if (input.baseline_path === 'self_reported' && !hasLifts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['known_lifts'],
        message: 'known_lifts must have at least one entry when baseline_path is "self_reported"',
      });
    }

    if (input.baseline_path === 'skipped' && hasLifts) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['known_lifts'],
        message: 'known_lifts must be empty or null when baseline_path is "skipped"',
      });
    }
  });

export type AthleteInputV2 = z.infer<typeof AthleteInputV2Schema>;
export type GoalParametersV2 = z.infer<typeof GoalParametersV2Schema>;
