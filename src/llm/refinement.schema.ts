import { z } from 'zod';
import { DayOfWeekSchema } from '../domain/shared/domain-enums.js';

export const refinementReasonCodes = [
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
  'NO_CHANGE_REQUIRED',
] as const;

export const refinementOperationTypes = [
  'replace_exercise',
  'reorder_exercise',
  'adjust_target_reps',
  'adjust_target_rpe',
  'adjust_rest_seconds',
  'adjust_set_count',
  'adjust_liss_duration',
  'update_subtitle',
  'add_coaching_cue',
  'add_review_trigger',
  'add_assumption',
  'no_change',
] as const;

const conciseString = z.string().trim().min(1).max(200);

export const RefinementOperationSchema = z
  .object({
    operation_id: z.string().regex(/^[a-z][a-z0-9_-]*$/),
    type: z.enum(refinementOperationTypes),
    phase_number: z.number().int().positive(),
    day_of_week: DayOfWeekSchema.nullable(),
    exercise_id: z.string().nullable(),
    replacement_exercise_id: z.string().nullable(),
    set_number: z.number().int().positive().nullable(),
    new_target_reps: z.number().int().positive().nullable(),
    new_target_rpe: z.number().min(1).max(8).nullable(),
    new_rpe_ceiling: z.number().min(1).max(8).nullable(),
    new_rest_seconds: z.number().int().nonnegative().nullable(),
    new_set_count: z.number().int().positive().nullable(),
    new_liss_duration_min: z.number().int().positive().nullable(),
    new_display_order: z.number().int().nonnegative().nullable(),
    new_subtitle: conciseString.nullable(),
    coaching_cue: conciseString.nullable(),
    review_trigger: conciseString.nullable(),
    reason_code: z.enum(refinementReasonCodes),
    reason: conciseString,
  })
  .strict()
  .superRefine((operation, context) => {
    const nullableFields = [
      'day_of_week',
      'exercise_id',
      'replacement_exercise_id',
      'set_number',
      'new_target_reps',
      'new_target_rpe',
      'new_rpe_ceiling',
      'new_rest_seconds',
      'new_set_count',
      'new_liss_duration_min',
      'new_display_order',
      'new_subtitle',
      'coaching_cue',
      'review_trigger',
    ] as const;
    const required: Partial<
      Record<
        (typeof refinementOperationTypes)[number],
        (keyof typeof operation)[]
      >
    > = {
      replace_exercise: [
        'day_of_week',
        'exercise_id',
        'replacement_exercise_id',
      ],
      reorder_exercise: ['day_of_week', 'exercise_id', 'new_display_order'],
      adjust_target_reps: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_target_reps',
      ],
      adjust_target_rpe: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_target_rpe',
        'new_rpe_ceiling',
      ],
      adjust_rest_seconds: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_rest_seconds',
      ],
      adjust_set_count: ['day_of_week', 'exercise_id', 'new_set_count'],
      adjust_liss_duration: ['day_of_week', 'new_liss_duration_min'],
      update_subtitle: ['day_of_week', 'new_subtitle'],
      add_coaching_cue: ['day_of_week', 'exercise_id', 'coaching_cue'],
      add_review_trigger: ['review_trigger'],
    };
    const allowed: Partial<
      Record<
        (typeof refinementOperationTypes)[number],
        (typeof nullableFields)[number][]
      >
    > = {
      replace_exercise: [
        'day_of_week',
        'exercise_id',
        'replacement_exercise_id',
      ],
      reorder_exercise: ['day_of_week', 'exercise_id', 'new_display_order'],
      adjust_target_reps: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_target_reps',
      ],
      adjust_target_rpe: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_target_rpe',
        'new_rpe_ceiling',
      ],
      adjust_rest_seconds: [
        'day_of_week',
        'exercise_id',
        'set_number',
        'new_rest_seconds',
      ],
      adjust_set_count: ['day_of_week', 'exercise_id', 'new_set_count'],
      adjust_liss_duration: ['day_of_week', 'new_liss_duration_min'],
      update_subtitle: ['day_of_week', 'new_subtitle'],
      add_coaching_cue: ['day_of_week', 'exercise_id', 'coaching_cue'],
      add_review_trigger: ['review_trigger'],
      add_assumption: [],
      no_change: [],
    };

    required[operation.type]?.forEach((key) => {
      if (operation[key] === null) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${String(key)} is required for ${operation.type}.`,
        });
      }
    });

    nullableFields.forEach((key) => {
      if (operation[key] !== null && !allowed[operation.type]?.includes(key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key],
          message: `${String(key)} is not allowed for ${operation.type}.`,
        });
      }
    });

    if (
      operation.type === 'adjust_target_rpe' &&
      operation.new_target_rpe !== null &&
      operation.new_rpe_ceiling !== null &&
      operation.new_target_rpe > operation.new_rpe_ceiling
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['new_target_rpe'],
        message: 'Target RPE must not exceed the RPE ceiling.',
      });
    }
  });

export const RefinementMetadataSchema = z
  .object({
    requested: z.boolean(),
    applied: z.boolean(),
    status: z.enum(['accepted', 'not_requested', 'fallback']),
    reason_code: z.string().nullable(),
    model: z.string().nullable(),
    prompt_version: z.string().nullable(),
    schema_version: z.number().int().positive().nullable(),
    provider_response_id: z.string().nullable().optional(),
    input_token_count: z.number().int().nonnegative().nullable().optional(),
    output_token_count: z.number().int().nonnegative().nullable().optional(),
    accepted_operation_count: z.number().int().nonnegative().optional(),
    rejected_operation_count: z.number().int().nonnegative().optional(),
  })
  .strict();

export const ProgrammeRefinementProposalSchema = z
  .object({
    decision: z.enum(['refine', 'no_change']),
    summary: z.string().trim().min(1).max(300),
    confidence: z.enum(['low', 'medium', 'high']),
    operations: z.array(RefinementOperationSchema).max(24),
    assumptions: z.array(z.string().trim().min(1).max(200)).max(8),
    review_triggers: z.array(z.string().trim().min(1).max(200)).max(8),
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
