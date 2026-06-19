import { z } from 'zod';

export const v2RefinementReasonCodes = [
  'GOAL_SPECIFICITY',
  'EXERCISE_PREFERENCE',
  'EQUIPMENT_FIT',
  'RESTRICTION_MODIFICATION',
  'FATIGUE_REDUCTION',
  'RECOVERY_FIT',
  'SESSION_TIME_FIT',
  'MOVEMENT_BALANCE',
  'SKILL_LEVEL_FIT',
  'ADHERENCE_SIMPLIFICATION',
  'EXERCISE_VARIETY',
  'CARDIO_ALLOCATION',
  'INTERFERENCE_REDUCTION',
  'CONDITIONING_PLACEMENT',
  'WARMUP_IMPROVEMENT',
  'NO_CHANGE_REQUIRED',
] as const;

export const v2RefinementOperationTypes = [
  'replace_exercise',
  'remove_optional_exercise',
  'reduce_optional_sets',
  'reorder_exercise',
  'move_conditioning',
  'reduce_conditioning_duration',
  'replace_conditioning_modality',
  'replace_optional_warmup_component',
] as const;

export type V2RefinementOperationType =
  (typeof v2RefinementOperationTypes)[number];

const identifier = z.string().min(1).max(100);
const conciseString = z.string().trim().min(1).max(200);

const baseFields = {
  operation_id: z.string().regex(/^[a-z][a-z0-9_-]*$/),
  target_id: identifier,
  reason_code: z.enum(v2RefinementReasonCodes),
  reason: conciseString,
};

const ReplaceExerciseSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('replace_exercise'),
    replacement_id: identifier,
  })
  .strict();

const RemoveOptionalExerciseSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('remove_optional_exercise'),
  })
  .strict();

const ReduceOptionalSetsSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('reduce_optional_sets'),
    new_value: z.number().int().positive(),
  })
  .strict();

const ReorderExerciseSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('reorder_exercise'),
    new_value: z.number().int().nonnegative(),
  })
  .strict();

const MoveConditioningSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('move_conditioning'),
    new_value: z.string().min(1),
  })
  .strict();

const ReduceConditioningDurationSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('reduce_conditioning_duration'),
    new_value: z.number().positive(),
  })
  .strict();

const ReplaceConditioningModalitySchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('replace_conditioning_modality'),
    replacement_id: identifier,
  })
  .strict();

const ReplaceOptionalWarmupComponentSchema = z
  .object({
    ...baseFields,
    operation_type: z.literal('replace_optional_warmup_component'),
    replacement_id: identifier,
    new_value: z.string().min(1).optional(),
  })
  .strict();

export const V2RefinementOperationSchema = z.discriminatedUnion(
  'operation_type',
  [
    ReplaceExerciseSchema,
    RemoveOptionalExerciseSchema,
    ReduceOptionalSetsSchema,
    ReorderExerciseSchema,
    MoveConditioningSchema,
    ReduceConditioningDurationSchema,
    ReplaceConditioningModalitySchema,
    ReplaceOptionalWarmupComponentSchema,
  ],
);

export const V2RefinementProposalSchema = z
  .object({
    decision: z.enum(['refine', 'no_change']),
    summary: z.string().trim().min(1).max(300),
    confidence: z.enum(['low', 'medium', 'high']),
    operations: z.array(V2RefinementOperationSchema).max(16),
  })
  .strict()
  .superRefine((proposal, context) => {
    const operationIds = proposal.operations.map(
      (operation) => operation.operation_id,
    );
    if (new Set(operationIds).size !== operationIds.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['operations'],
        message: 'Operation IDs must be unique.',
      });
    }
    if (proposal.decision === 'no_change' && proposal.operations.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['operations'],
        message: 'No-change proposals must not contain operations.',
      });
    }
    if (proposal.decision === 'refine' && proposal.operations.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['operations'],
        message: 'Refinement proposals require at least one operation.',
      });
    }
  });

export const V2RefinementMetadataSchema = z
  .object({
    requested: z.boolean(),
    attempted: z.boolean(),
    applied: z.boolean(),
    retry_attempted: z.boolean(),
    operation_count: z.number().int().nonnegative(),
    accepted_operation_types: z.array(z.string()),
    status: z.enum(['not_requested', 'applied', 'fallback', 'failed']),
    reason_code: z.string().nullable(),
  })
  .strict();
