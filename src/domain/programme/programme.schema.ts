import { z } from 'zod';
import {
  AthleteGoalSchema,
  DAYS_OF_WEEK,
  DayOfWeekSchema,
  EquipmentAvailabilitySchema,
  ProgressionIntentSchema,
  ValidationWarningSeveritySchema,
  WorkoutTypeSchema,
} from '../shared/domain-enums.js';

const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Must be a valid ISO date string',
  });

const uniqueBy = <T>(items: T[], key: (item: T) => string | number): boolean =>
  new Set(items.map(key)).size === items.length;

const OrderedItemSchema = z.object({
  item_key: z.string().min(1),
  label: z.string(),
  detail: z.string(),
  display_order: z.number().int().nonnegative(),
});

const ExerciseSetPrescriptionSchema = z
  .object({
    set_number: z.number().int().positive(),
    target_reps: z.number().int().positive(),
    target_rpe: z.number().min(1).max(10),
    rpe_ceiling: z.number().min(1).max(10),
    rest_seconds: z.number().int().nonnegative(),
    set_type: z.enum(['working', 'backoff', 'calibration']),
  })
  .superRefine((set, ctx) => {
    if (set.rpe_ceiling < set.target_rpe) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rpe_ceiling must be greater than or equal to target_rpe',
        path: ['rpe_ceiling'],
      });
    }
  });

const ExercisePrescriptionSchema = z
  .object({
    display_order: z.number().int().nonnegative(),
    exercise_id: z.string().min(1),
    exercise_name: z.string().min(1),
    tags: z.array(z.string()),
    coaching_cues: z.array(z.string()),
    warnings: z.array(z.string()),
    sets: z.array(ExerciseSetPrescriptionSchema).min(1),
    progression_bounds: z.object({
      rep_min: z.number().int().positive(),
      rep_max: z.number().int().positive(),
    }),
    progression_rule: z.string().min(1),
    equipment: z.array(z.string()),
    movement_patterns: z.array(z.string()),
    primary_muscles: z.array(z.string()),
    secondary_muscles: z.array(z.string()),
  })
  .superRefine((exercise, ctx) => {
    if (
      exercise.progression_bounds.rep_max < exercise.progression_bounds.rep_min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'progression rep_max must be greater than or equal to rep_min',
        path: ['progression_bounds', 'rep_max'],
      });
    }
    if (!uniqueBy(exercise.sets, (set) => set.set_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'set_number values must be unique',
        path: ['sets'],
      });
    }
    if (
      exercise.sets.some(
        (set) =>
          set.target_reps < exercise.progression_bounds.rep_min ||
          set.target_reps > exercise.progression_bounds.rep_max,
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'set target reps must fit progression bounds',
        path: ['sets'],
      });
    }
  });

const DayTemplateSchema = z
  .object({
    day_of_week: DayOfWeekSchema,
    workout_type: WorkoutTypeSchema,
    title: z.string(),
    subtitle: z.string(),
    duration_min: z.number().int().positive().nullable(),
    tags: z.array(z.string()),
    has_warmup: z.boolean(),
    liss_content: z.string().nullable(),
    cooldown_items: z.array(OrderedItemSchema),
    exercises: z.array(ExercisePrescriptionSchema),
  })
  .superRefine((day, ctx) => {
    if (!uniqueBy(day.cooldown_items, (item) => item.display_order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cooldown display_order values must be unique',
        path: ['cooldown_items'],
      });
    }
    if (!uniqueBy(day.exercises, (exercise) => exercise.display_order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'exercise display_order values must be unique',
        path: ['exercises'],
      });
    }
    if (day.workout_type === 'workout' && day.exercises.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'workout days must contain at least one exercise',
        path: ['exercises'],
      });
    }
    if (day.workout_type === 'liss') {
      if (day.exercises.length > 0)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'LISS days must contain no exercises',
          path: ['exercises'],
        });
      if (day.liss_content === null)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'LISS days require liss_content',
          path: ['liss_content'],
        });
    }
    if (day.workout_type === 'rest') {
      if (day.exercises.length > 0)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'rest days must contain no exercises',
          path: ['exercises'],
        });
      if (day.liss_content !== null)
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'rest days require liss_content to be null',
          path: ['liss_content'],
        });
    }
  });

const PhaseSchema = z.object({
  phase_number: z.number().int().positive(),
  name: z.string(),
  goal: z.string(),
  weeks_count: z.number().int().positive(),
  intensity_level: z.number().int().min(1).max(10),
  volume_level: z.number().int().min(1).max(10),
  progression_intent: ProgressionIntentSchema,
});

const PhaseWeekTemplateSchema = z
  .object({
    phase_number: z.number().int().positive(),
    days: z.array(DayTemplateSchema),
  })
  .superRefine((template, ctx) => {
    if (template.days.length !== 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'each phase week template must contain exactly seven days',
        path: ['days'],
      });
    }
    const seenDays = new Set(template.days.map((day) => day.day_of_week));
    if (seenDays.size !== 7 || DAYS_OF_WEEK.some((day) => !seenDays.has(day))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'each day of the week must appear exactly once per phase template',
        path: ['days'],
      });
    }
  });

const ScoreSchema = z.number().min(0).max(100);

export const OdinProgrammeSchema = z
  .object({
    programme: z.object({
      name: z.string(),
      goal_type: AthleteGoalSchema,
      goal_description: z.string(),
      start_weight_kg: z.number().positive(),
      target_weight_kg: z.number().positive(),
      target_weeks: z.number().int().positive(),
      available_days: z.number().int().min(2).max(7),
      equipment: EquipmentAvailabilitySchema,
      started_at: isoDateString,
    }),
    config: z.object({
      start_date: isoDateString,
      phase_weeks: z.array(z.number().int().positive()),
      min_active_days: z.number().int().nonnegative(),
      total_phases: z.number().int().positive(),
    }),
    phases: z.array(PhaseSchema),
    phase_week_templates: z.array(PhaseWeekTemplateSchema),
    warmup_items: z.array(OrderedItemSchema),
    assumptions: z.array(z.string()),
    review_triggers: z.array(z.string()),
    validation_summary: z.object({
      passed: z.boolean(),
      scores: z.object({
        constraint_fit: ScoreSchema,
        movement_balance: ScoreSchema,
        recovery_fit: ScoreSchema,
        goal_specificity: ScoreSchema,
        progression_quality: ScoreSchema,
        session_time_fit: ScoreSchema,
      }),
      warnings: z.array(
        z.object({
          code: z.string(),
          severity: ValidationWarningSeveritySchema,
          message: z.string(),
        }),
      ),
    }),
  })
  .superRefine((programme, ctx) => {
    if (programme.config.phase_weeks.length !== programme.config.total_phases) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'phase_weeks length must equal total_phases',
        path: ['config', 'phase_weeks'],
      });
    }
    if (programme.phases.length !== programme.config.total_phases) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'phases length must equal total_phases',
        path: ['phases'],
      });
    }
    if (!uniqueBy(programme.phases, (phase) => phase.phase_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'phase numbers must be unique',
        path: ['phases'],
      });
    }
    if (!uniqueBy(programme.warmup_items, (item) => item.display_order)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'warmup display_order values must be unique',
        path: ['warmup_items'],
      });
    }
  });
