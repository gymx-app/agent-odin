import { z } from 'zod';
import { SexSchema } from '../shared/domain-enums.js';

export const FieldTestResultsSchema = z
  .object({
    pushup_reps: z.number().int().min(0).max(200),
    bodyweight_squat_reps_60s: z.number().int().min(0).max(200),
    dead_hang_seconds: z.number().min(0).max(300),
    plank_hold_seconds: z.number().min(0).max(600).optional(),
  })
  .strict();

export const KnownLiftSchema = z
  .object({
    movement_pattern: z.enum([
      'squat',
      'hip_hinge',
      'horizontal_push',
      'horizontal_pull',
      'vertical_push',
      'vertical_pull',
    ]),
    weight_kg: z.number().positive().max(500),
    reps: z.number().int().min(1).max(30),
  })
  .strict();

export const BaselineAssessmentInputSchema = z
  .object({
    sex: SexSchema,
    age: z.number().int().min(16).max(100),
    bodyweight_kg: z.number().positive().max(500),
    field_tests: FieldTestResultsSchema.optional(),
    known_lifts: z.array(KnownLiftSchema).optional(),
  })
  .strict()
  .superRefine((input, ctx) => {
    if (!input.field_tests && (!input.known_lifts || input.known_lifts.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'BASELINE_REQUIRES_FIELD_TESTS_OR_KNOWN_LIFTS',
      });
    }
  });

export type FieldTestResults = z.infer<typeof FieldTestResultsSchema>;
export type KnownLift = z.infer<typeof KnownLiftSchema>;
export type BaselineAssessmentInput = z.infer<typeof BaselineAssessmentInputSchema>;

export type MovementPattern =
  | 'squat'
  | 'hip_hinge'
  | 'horizontal_push'
  | 'horizontal_pull'
  | 'vertical_push'
  | 'vertical_pull';

export type FitnessTier =
  | 'poor'
  | 'below_average'
  | 'average'
  | 'above_average'
  | 'excellent';

export type BaselineEstimate = {
  movement_pattern: MovementPattern;
  estimated_1rm_kg: number;
  source: 'field_test' | 'known_lift' | 'ratio_default';
  confidence: 'low' | 'moderate' | 'high';
  rationale_codes: string[];
};

export type BaselineAssessmentResult = {
  fitness_tier: FitnessTier;
  estimates: BaselineEstimate[];
  rationale_codes: string[];
};
