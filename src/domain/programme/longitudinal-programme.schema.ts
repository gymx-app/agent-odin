import { z } from 'zod';
import {
  AthleteGoalSchema,
  DAYS_OF_WEEK,
  DayOfWeekSchema,
} from '../shared/domain-enums.js';
import { PlannerVersionSchema } from './planner-version.js';

export const PROGRAMME_FACTOR_MIN = 0.5;
export const PROGRAMME_FACTOR_MAX = 1.5;

const uniqueBy = <T>(items: T[], key: (item: T) => string | number): boolean =>
  new Set(items.map(key)).size === items.length;

const dateString = z.string().date();
const isoDateString = z.string().datetime();
const identifier = z.string().min(1).max(100);
const conciseName = z.string().min(1).max(60);
const factor = z.number().min(PROGRAMME_FACTOR_MIN).max(PROGRAMME_FACTOR_MAX);
const confidence = z.enum(['low', 'moderate', 'high']);
const direction = z.enum(['decrease', 'maintain', 'increase', 'wave']);
const demandLevel = z.enum(['none', 'low', 'moderate', 'high']);
const ConditioningModalitySchema = z.enum([
  'walking',
  'incline_walking',
  'stationary_bike',
  'elliptical',
  'rowing',
  'stair_machine',
  'running',
  'sled',
  'swimming',
  'assault_bike',
  'sport',
  'other_approved',
]);
const ConditioningIntensitySchema = z.object({
  method: z.enum([
    'heart_rate',
    'heart_rate_reserve',
    'talk_test',
    'session_rpe',
    'pace',
    'power',
    'machine_level',
  ]),
  target_min: z.number().optional(),
  target_max: z.number().optional(),
  target_label: z.string().min(1).optional(),
});

const CalendarDemandProfileSchema = z.object({
  systemic: demandLevel,
  upper_body: demandLevel,
  lower_body: demandLevel,
  push: demandLevel,
  pull: demandLevel,
  hinge: demandLevel,
  knee_dominant: demandLevel,
  impact: demandLevel,
});

const PlanningAssumptionSchema = z.object({
  code: identifier,
  message: z.string().min(1),
  confidence,
  source_fields: z.array(z.string().min(1)),
});

const ReviewTriggerSchema = z.object({
  code: identifier,
  message: z.string().min(1),
  trigger_type: z.enum([
    'performance',
    'recovery',
    'pain',
    'schedule',
    'body_composition',
    'conditioning',
    'programme_completion',
  ]),
});

const StrategyDecisionSchema = z.object({
  code: identifier,
  selected_value: z.string().min(1),
  reason: z.string().min(1),
  source_fields: z.array(z.string().min(1)),
  confidence,
});

const ProgressionModelSchema = z.enum([
  'linear_load',
  'linear_reps',
  'double_progression',
  'step_loading',
  'wave_loading',
  'volume_then_intensity',
  'performance_based',
  'maintenance',
]);

const WarmupPrescriptionSchema = z
  .object({
    warmup_id: identifier,
    display_order: z.number().int().nonnegative(),
    component_type: z.enum([
      'pulse_raiser',
      'dynamic_mobility',
      'movement_rehearsal',
      'activation',
      'targeted_mobility',
      'ramp_up_set',
    ]),
    activity_name: z.string().min(1),
    exercise_id: identifier.optional(),
    duration_seconds: z.number().int().positive().optional(),
    repetitions: z.number().int().positive().optional(),
    intensity: z.string().min(1).optional(),
    purpose: z.string().min(1),
    related_exercise_id: identifier.optional(),
    rationale_codes: z.array(identifier),
  })
  .superRefine((item, ctx) => {
    if (item.duration_seconds === undefined && item.repetitions === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'warm-up requires duration_seconds or repetitions',
      });
    }
  });

const ExerciseSetPrescriptionSchema = z
  .object({
    set_number: z.number().int().positive(),
    set_type: z.enum(['working', 'backoff', 'calibration']),
    target_reps: z.number().int().positive(),
    target_rpe: z.number().min(1).max(10),
    rpe_ceiling: z.number().min(1).max(10),
    rest_seconds: z.number().int().nonnegative(),
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

const ProgressionBoundsSchema = z
  .object({
    rep_min: z.number().int().positive(),
    rep_max: z.number().int().positive(),
    load_increment_type: z.enum([
      'absolute',
      'percentage',
      'smallest_available',
      'none',
    ]),
    minimum_load_increment: z.number().positive().optional(),
  })
  .superRefine((bounds, ctx) => {
    if (bounds.rep_max < bounds.rep_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rep_max must be greater than or equal to rep_min',
        path: ['rep_max'],
      });
    }
    if (
      bounds.load_increment_type === 'none' &&
      bounds.minimum_load_increment !== undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'minimum_load_increment is forbidden when increment type is none',
        path: ['minimum_load_increment'],
      });
    }
  });

// odin-programme-design-logic.md, Section 3. 'straight' is the safe,
// always-valid default — every producer must state a choice rather than
// leave this a guess. Pyramid needs no parameters beyond the label: it's
// already expressible via varying target_reps/target_rpe across `sets[]`.
// Superset/giant_set are grouping techniques (see superset_group_id below),
// not single-exercise parameters, but share the same type/rationale surface.
const SetStructureSchema = z
  .object({
    type: z.enum([
      'straight',
      'pyramid',
      'drop_set',
      'rest_pause',
      'cluster',
      'superset',
      'giant_set',
    ]),
    applies_to: z.enum(['all_sets', 'last_set_only']).optional(),
    drop_set_detail: z
      .object({
        drop_count: z.number().int().min(1).max(3),
        load_drop_pct: z.number().min(10).max(40),
      })
      .optional(),
    rest_pause_detail: z
      .object({
        intra_set_rest_seconds: z.number().int().min(10).max(20),
        mini_set_count: z.number().int().min(1).max(3),
      })
      .optional(),
    cluster_detail: z
      .object({
        intra_set_rest_seconds: z.number().int().min(15).max(45),
      })
      .optional(),
    rationale_codes: z.array(identifier),
  })
  .superRefine((s, ctx) => {
    const detailKeyFor: Partial<Record<typeof s.type, string>> = {
      drop_set: 'drop_set_detail',
      rest_pause: 'rest_pause_detail',
      cluster: 'cluster_detail',
    };
    const requiredDetailKey = detailKeyFor[s.type];
    const detailKeys = [
      'drop_set_detail',
      'rest_pause_detail',
      'cluster_detail',
    ] as const;
    detailKeys.forEach((key) => {
      const present = s[key] !== undefined;
      const shouldBePresent = key === requiredDetailKey;
      if (present !== shouldBePresent) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: shouldBePresent
            ? `${s.type} requires ${key}`
            : `${key} is only valid when type is the matching structure`,
          path: [key],
        });
      }
    });
    if (s.type !== 'straight' && s.rationale_codes.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'non-straight set structures require rationale_codes',
        path: ['rationale_codes'],
      });
    }
  });

const ExercisePrescriptionSchema = z
  .object({
    prescription_id: identifier,
    exercise_id: identifier,
    exercise_name: z.string().min(1).max(80),
    display_order: z.number().int().nonnegative(),
    set_structure: SetStructureSchema,
    // Exercises sharing a superset_group_id run back-to-back (minimal rest
    // between members) as a superset (2 members) or giant set (3+),
    // mirroring the existing substitution_group_id grouping precedent below.
    superset_group_id: identifier.optional(),
    sequence_role: z.enum([
      'power',
      'primary',
      'secondary',
      'accessory',
      'isolation',
      'core',
    ]),
    priority: z.number().int().positive(),
    tags: z.array(z.string()),
    coaching_cues: z.array(z.string()),
    warnings: z.array(z.string()),
    sets: z.array(ExerciseSetPrescriptionSchema).min(1),
    progression_bounds: ProgressionBoundsSchema,
    progression_rule_id: identifier,
    substitution_group_id: identifier.optional(),
    substitution_options: z
      .object({
        approved_exercise_ids: z.array(identifier),
        preserve: z.enum([
          'movement_pattern',
          'target_muscle',
          'fatigue_profile',
          'equipment_category',
        ]),
      })
      .optional(),
    user_progression_rule: z.string().min(1),
    modification_metadata: z
      .object({
        required: z.boolean(),
        cues: z.array(z.string().min(1)),
        restriction_tags: z.array(identifier),
      })
      .optional(),
    equipment: z.array(z.string()),
    movement_patterns: z.array(z.string()),
    primary_muscles: z.array(z.string()),
    secondary_muscles: z.array(z.string()),
    sequencing_rationale: z.array(z.string()),
    weight_kg: z.number().positive().nullable(),
    // odin-programme-design-logic.md, Section 4: a bodyweight-ratio-default
    // 1RM estimate must never be presented with the same certainty as a
    // self-reported one — required whenever weight_kg is non-null so the
    // Why tab can't silently drop the distinction.
    weight_confidence: z.enum(['low', 'moderate', 'high']).optional(),
  })
  .superRefine((exercise, ctx) => {
    if (!uniqueBy(exercise.sets, (set) => set.set_number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'set numbers must be unique',
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
        message: 'target reps must fit progression bounds',
        path: ['sets'],
      });
    }
    if ((exercise.weight_kg !== null) !== (exercise.weight_confidence !== undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'weight_confidence is required whenever weight_kg is set, and forbidden when it is null',
        path: ['weight_confidence'],
      });
    }
  });

const ConditioningPrescriptionSchema = z
  .object({
    conditioning_id: identifier,
    display_order: z.number().int().nonnegative(),
    conditioning_type: z.enum([
      'low_intensity_steady_state',
      'moderate_continuous',
      'threshold',
      'intervals',
      'sprint_intervals',
      'sport_conditioning',
      'active_recovery',
      'movement_target',
    ]),
    activity_id: ConditioningModalitySchema,
    exercise_id: identifier.optional(),
    activity_name: z.string().min(1),
    purpose: z.string().min(1),
    duration_min: z.number().positive(),
    intensity: ConditioningIntensitySchema,
    intervals: z
      .object({
        work_seconds: z.number().int().positive(),
        recovery_seconds: z.number().int().nonnegative(),
        interval_count: z.number().int().positive(),
        work_intensity: ConditioningIntensitySchema,
        recovery_intensity: ConditioningIntensitySchema,
      })
      .optional(),
    impact_level: z.enum(['low', 'moderate', 'high']),
    fatigue_cost: z.enum(['low', 'moderate', 'high']),
    placement: z.enum([
      'standalone',
      'before_resistance',
      'after_resistance',
      'same_day_separate_session',
      'sport_session',
      'movement_target',
    ]),
    same_day_separation: z
      .object({
        category: z.enum([
          'same_session',
          'under_6_hours',
          '6_to_12_hours',
          'over_12_hours',
          'separate_days',
        ]),
      })
      .optional(),
    interference_risk: z.enum(['low', 'moderate', 'high', 'unacceptable']),
    progression_policy_id: identifier,
    rationale: z.array(z.string()),
    modification_metadata: z
      .object({
        required: z.boolean(),
        instructions: z.array(z.string().min(1)),
        restriction_tags: z.array(identifier),
      })
      .optional(),
  })
  .superRefine((item, ctx) => {
    const intervalBased = ['intervals', 'sprint_intervals'].includes(
      item.conditioning_type,
    );
    if (intervalBased !== (item.intervals !== undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: intervalBased
          ? 'interval conditioning requires interval details'
          : 'non-interval conditioning forbids interval details',
        path: ['intervals'],
      });
    }
    if (
      item.intensity.target_min === undefined &&
      item.intensity.target_max === undefined &&
      item.intensity.target_label === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'conditioning intensity requires a measurable target',
        path: ['intensity'],
      });
    }
    if (
      (item.placement === 'same_day_separate_session') !==
      (item.same_day_separation !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'same_day_separation is required only for separate same-day sessions',
        path: ['same_day_separation'],
      });
    }
  });

const CooldownPrescriptionSchema = z.object({
  cooldown_id: identifier,
  display_order: z.number().int().nonnegative(),
  activity_name: z.string().min(1),
  exercise_id: identifier.optional(),
  duration_seconds: z.number().int().positive().optional(),
  repetitions: z.number().int().positive().optional(),
  purpose: z.string().min(1),
});

const SessionTrainingBudgetSchema = z.object({
  total_working_set_budget: z.number().int().nonnegative(),
  muscle_group_budgets: z.record(z.number().int().nonnegative()),
  movement_pattern_budgets: z.record(z.number().int().nonnegative()),
  intensity_intent: z.enum([
    'technique',
    'light',
    'moderate',
    'heavy',
    'mixed',
    'recovery',
  ]),
  effort_target: z.number().min(1).max(10),
  rpe_ceiling: z.number().min(1).max(10),
  fatigue_ceiling: z.enum(['low', 'moderate', 'high']),
  estimated_duration_min: z.number().int().nonnegative(),
  rationale_codes: z.array(identifier),
});

const ProgrammeDaySchema = z
  .object({
    day_id: identifier,
    cycle_day: z.number().int().positive(),
    day_of_week: DayOfWeekSchema.optional(),
    day_type: z.enum([
      'resistance',
      'conditioning',
      'combined',
      'sport',
      'recovery',
      'rest',
    ]),
    title: z.string().min(1).max(80),
    subtitle: z.string().max(120).optional(),
    estimated_duration_min: z.number().int().positive().nullable(),
    maximum_duration_min: z.number().int().positive().nullable(),
    fatigue_classification: z.enum(['none', 'low', 'moderate', 'high']),
    movement_emphasis: z.array(z.string()),
    warmup: z.array(WarmupPrescriptionSchema),
    exercises: z.array(ExercisePrescriptionSchema),
    conditioning: z.array(ConditioningPrescriptionSchema),
    cooldown: z.array(CooldownPrescriptionSchema),
    training_budget: SessionTrainingBudgetSchema.optional(),
    session_metadata: z
      .object({
        session_id: identifier,
        session_kind: z.enum([
          'full_body',
          'upper',
          'lower',
          'push',
          'pull',
          'legs',
          'specialized',
          'sport_support',
        ]),
        objective: z.string().min(1),
        phase_objective: z.string().min(1),
        rationale_codes: z.array(identifier),
        duration_breakdown: z.object({
          working_time_min: z.number().int().nonnegative(),
          rest_time_min: z.number().int().nonnegative(),
          setup_transition_min: z.number().int().nonnegative(),
          warmup_allowance_min: z.number().int().nonnegative(),
          cooldown_allowance_min: z.number().int().nonnegative(),
        }),
        sequence_exceptions: z
          .array(
            z.object({
              code: identifier,
              severity: z.enum(['information', 'warning']),
              affected_exercise_ids: z.array(identifier),
              reason: z.string().min(1),
            }),
          )
          .optional(),
      })
      .optional(),
  })
  .superRefine((day, ctx) => {
    const requiresResistance = ['resistance', 'combined'].includes(
      day.day_type,
    );
    // 'sport' days always carry a sport_conditioning entry representing the
    // athlete's reported sport load (see conditioning-planner.ts's
    // day_type === 'sport' branch) — this isn't optional, so 'sport' must
    // be treated as conditioning-bearing like 'conditioning'/'combined'.
    const requiresConditioning = ['conditioning', 'combined', 'sport'].includes(
      day.day_type,
    );
    const plannedResistance =
      day.exercises.length > 0 ||
      (day.training_budget?.total_working_set_budget ?? 0) > 0;
    if (requiresResistance !== plannedResistance) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${day.day_type} day has invalid resistance content`,
        path: ['exercises'],
      });
    }
    const hasFinisherOnly =
      day.day_type === 'resistance' &&
      day.conditioning.length > 0 &&
      day.conditioning.every((item) => item.placement === 'after_resistance');
    const plannedConditioning =
      (!hasFinisherOnly && day.conditioning.length > 0) ||
      (requiresConditioning && day.training_budget !== undefined);
    if (requiresConditioning !== plannedConditioning) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${day.day_type} day has invalid conditioning content`,
        path: ['conditioning'],
      });
    }
    if (
      day.day_type === 'rest' &&
      (day.exercises.length > 0 ||
        day.conditioning.length > 0 ||
        day.training_budget !== undefined)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rest days cannot contain Odin prescriptions',
      });
    }
    if (
      day.day_type === 'sport' &&
      (day.exercises.length > 0 ||
        day.training_budget !== undefined ||
        day.conditioning.some(
          (item) =>
            item.conditioning_type !== 'sport_conditioning' ||
            item.placement !== 'sport_session',
        ))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'sport days permit only represented sport-conditioning prescriptions',
      });
    }
    if (
      day.day_type === 'recovery' &&
      day.conditioning.some(
        (item) =>
          item.conditioning_type !== 'active_recovery' ||
          item.fatigue_cost !== 'low' ||
          item.impact_level !== 'low',
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'recovery days permit only low-cost active recovery',
        path: ['conditioning'],
      });
    }
    const rest = day.day_type === 'rest';
    if (
      rest !==
      (day.estimated_duration_min === null && day.maximum_duration_min === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'only rest days may use null durations',
      });
    }
    if (
      day.estimated_duration_min !== null &&
      day.maximum_duration_min !== null &&
      day.estimated_duration_min > day.maximum_duration_min
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'estimated duration cannot exceed maximum duration',
      });
    }
    [
      ['warmup', day.warmup],
      ['exercises', day.exercises],
      ['conditioning', day.conditioning],
      ['cooldown', day.cooldown],
    ].forEach(([path, items]) => {
      const ordered = items as Array<{ display_order: number }>;
      if (!uniqueBy(ordered, (item) => item.display_order)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${String(path)} display orders must be unique`,
          path: [String(path)],
        });
      }
    });
    const groups = new Map<string, typeof day.exercises>();
    day.exercises.forEach((exercise) => {
      if (!exercise.superset_group_id) return;
      const group = groups.get(exercise.superset_group_id) ?? [];
      group.push(exercise);
      groups.set(exercise.superset_group_id, group);
    });
    groups.forEach((members, groupId) => {
      const expectedType = members.length >= 3 ? 'giant_set' : 'superset';
      if (
        members.some((member) => member.set_structure.type !== expectedType)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `superset_group_id ${groupId} members must all use set_structure.type '${expectedType}' matching the group size`,
          path: ['exercises'],
        });
      }
      const orders = members
        .map((member) => member.display_order)
        .sort((a, b) => a - b);
      const contiguous = orders.every(
        (value, index) => index === 0 || value === orders[index - 1]! + 1,
      );
      if (!contiguous) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `superset_group_id ${groupId} members must have contiguous display_order values`,
          path: ['exercises'],
        });
      }
    });
  });

export const ProgrammeWeekSchema = z.object({
  week_id: identifier,
  week_number: z.number().int().positive(),
  week_type: z.enum([
    'introduction',
    'loading',
    'overload',
    'deload',
    'testing',
    'maintenance',
  ]),
  objective: z.string().min(1),
  planned_volume_factor: factor,
  planned_intensity_factor: factor,
  planned_effort_factor: factor,
  days: z.array(ProgrammeDaySchema).min(1),
  progression_notes: z.array(z.string()),
  review_triggers: z.array(ReviewTriggerSchema),
  planning_metadata: z.object({
    muscle_group_budgets: z.array(
      z.object({
        muscle_group: identifier,
        direct_set_target: z.number().int().nonnegative(),
        indirect_set_credit: z.number().int().nonnegative(),
        minimum_effective_target: z.number().int().nonnegative(),
        maximum_recoverable_target: z.number().int().positive(),
        priority: z.enum(['low', 'moderate', 'high']),
        rationale_codes: z.array(identifier),
      }),
    ),
    movement_pattern_budgets: z.array(
      z.object({
        movement_pattern: identifier,
        set_target: z.number().int().nonnegative(),
        priority: z.enum(['low', 'moderate', 'high']),
        rationale_codes: z.array(identifier),
      }),
    ),
    intensity_target: z.object({
      rep_emphasis: z.enum([
        'power',
        'strength',
        'hypertrophy',
        'high_rep_hypertrophy',
        'endurance_accessory',
        'mixed',
      ]),
      loading_intent: z.enum([
        'technique',
        'light',
        'moderate',
        'heavy',
        'mixed',
      ]),
      primary_exercise_target_rpe: z.number().min(1).max(10),
      secondary_exercise_target_rpe: z.number().min(1).max(10),
      accessory_target_rpe: z.number().min(1).max(10),
      maximum_allowed_rpe: z.number().min(1).max(10),
      failure_exposure_policy: z.enum([
        'none',
        'limited_isolation_only',
        'last_set_optional',
        'phase_specific',
      ]),
      rationale_codes: z.array(identifier),
    }),
    progression_policy: z.object({
      model: ProgressionModelSchema,
      success_condition: z.object({
        all_sets_completed: z.boolean(),
        target_reps_met: z.boolean(),
        maximum_rpe: z.number().min(1).max(10),
      }),
      next_action: z.object({
        type: z.enum([
          'increase_reps',
          'increase_load',
          'increase_sets',
          'hold',
        ]),
        increment: z.enum(['one_rep', 'smallest_available', 'one_set', 'none']),
      }),
      hold_condition: z.object({
        target_reps_met: z.boolean(),
        rpe_above_target: z.boolean(),
      }),
      regression_condition: z.object({
        missed_reps: z.boolean(),
        repeated_exposures: z.number().int().positive(),
      }),
    }),
    fatigue_budget: z.object({
      systemic_target: z.enum(['low', 'moderate', 'high']),
      lower_body_target: z.enum(['low', 'moderate', 'high']),
      upper_body_target: z.enum(['low', 'moderate', 'high']),
      grip_target: z.enum(['low', 'moderate', 'high']),
      lower_back_target: z.enum(['low', 'moderate', 'high']),
      conditioning_target: z.enum(['low', 'moderate', 'high']),
      rationale_codes: z.array(identifier),
    }),
    conditioning_load: z
      .object({
        formal_session_count: z.number().int().nonnegative(),
        sport_session_count: z.number().int().nonnegative(),
        low_intensity_minutes: z.number().int().nonnegative(),
        moderate_intensity_minutes: z.number().int().nonnegative(),
        high_intensity_minutes: z.number().int().nonnegative(),
        high_impact_minutes: z.number().int().nonnegative(),
        sprint_exposure_count: z.number().int().nonnegative(),
        estimated_fatigue: z.enum(['low', 'moderate', 'high']),
        rationale_codes: z.array(identifier),
      })
      .optional(),
    deload_adjustments: z
      .object({
        volume_factor: z.number().min(0.5).max(1),
        intensity_factor: z.number().min(0.75).max(1),
        effort_factor: z.number().min(0.75).max(1),
        conditioning_factor: z.number().min(0.5).max(1),
        exercise_complexity_reduction: z.boolean(),
      })
      .optional(),
    rationale_codes: z.array(identifier),
  }),
});

export const ProgrammePhaseSchema = z
  .object({
    phase_id: identifier,
    phase_number: z.number().int().positive(),
    name: conciseName,
    phase_type: z.enum([
      'foundation',
      'accumulation',
      'intensification',
      'realization',
      'recovery',
      'maintenance',
    ]),
    objective: z.string().min(1),
    start_week: z.number().int().positive(),
    end_week: z.number().int().positive(),
    weeks_count: z.number().int().positive(),
    volume_direction: direction,
    intensity_direction: direction,
    effort_direction: direction,
    progression_model: ProgressionModelSchema,
    weeks: z.array(ProgrammeWeekSchema).min(1),
    rationale: z.array(StrategyDecisionSchema),
  })
  .superRefine((phase, ctx) => {
    if (
      phase.end_week < phase.start_week ||
      phase.weeks_count !== phase.end_week - phase.start_week + 1
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'phase boundaries and weeks_count must agree',
      });
    }
    const expected = Array.from(
      { length: phase.weeks_count },
      (_, index) => phase.start_week + index,
    );
    if (
      phase.weeks.length !== phase.weeks_count ||
      phase.weeks.some((week, index) => week.week_number !== expected[index])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'explicit phase weeks must match phase boundaries',
        path: ['weeks'],
      });
    }
  });

export const CalendarSchema = z
  .object({
    cycle_type: z.enum(['weekly', 'rolling']),
    cycle_length_days: z.number().int().positive(),
    anchor_date: dateString,
    repeats: z.boolean(),
    exceptions: z
      .array(
        z.object({
          code: identifier,
          severity: z.enum(['information', 'warning']),
          message: z.string().min(1),
          affected_cycle_days: z.array(z.number().int().positive()),
          reason: z.string().min(1),
        }),
      )
      .optional(),
    days: z.array(
      z.object({
        cycle_day: z.number().int().positive(),
        day_of_week: DayOfWeekSchema.optional(),
        planned_session_type: z.enum([
          'resistance',
          'conditioning',
          'combined',
          'sport',
          'recovery',
          'rest',
        ]),
        session_label: conciseName,
        session_kind: z
          .enum([
            'full_body',
            'upper',
            'lower',
            'push',
            'pull',
            'legs',
            'conditioning',
            'sport',
            'recovery',
            'rest',
          ])
          .optional(),
        emphasis: z.string().min(1).max(100).optional(),
        demand_profile: CalendarDemandProfileSchema.optional(),
      }),
    ),
  })
  .superRefine((calendar, ctx) => {
    const expected = Array.from(
      { length: calendar.cycle_length_days },
      (_, index) => index + 1,
    );
    if (
      calendar.days.length !== calendar.cycle_length_days ||
      calendar.days.some((day, index) => day.cycle_day !== expected[index])
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'calendar cycle days must be consecutive and complete',
        path: ['days'],
      });
    }
    if (calendar.cycle_type === 'weekly') {
      if (
        calendar.cycle_length_days !== 7 ||
        calendar.days.some((day) => day.day_of_week === undefined) ||
        !uniqueBy(calendar.days, (day) => day.day_of_week ?? '')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'weekly calendars require seven unique weekdays',
          path: ['days'],
        });
      }
    } else if (calendar.cycle_length_days <= 7) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'rolling calendars must explicitly exceed seven days',
        path: ['cycle_length_days'],
      });
    }
  });

export const LongitudinalOdinProgrammeSchema = z
  .object({
    schema_version: z.literal('2.0'),
    planner_version: PlannerVersionSchema,
    programme: z.object({
      name: conciseName,
      goal_type: AthleteGoalSchema,
      goal_description: z.string().min(1),
      start_date: dateString,
      target_weeks: z.number().int().positive(),
      start_weight_kg: z.number().positive(),
      target_weight_kg: z.number().positive(),
      status: z.literal('preview'),
    }),
    athlete_summary: z.object({
      training_status: z.string().min(1),
      recovery_capacity: z.string().min(1),
      energy_availability: z.string().min(1),
      movement_limitation_level: z.string().min(1),
      sport_interference_risk: z.string().min(1),
      programme_confidence: z.string().min(1),
    }),
    strategy: z.object({
      primary_objective: z.enum([
        'fat_loss',
        'muscle_gain',
        'strength',
        'recomposition',
        'endurance',
        'general_fitness',
        'sport_support',
      ]),
      periodization_model: z.enum([
        'simple_progressive',
        'block',
        'undulating',
        'concurrent',
        'maintenance',
        'competition_peak',
      ]),
      progression_model: ProgressionModelSchema,
      split_type: z.enum([
        'full_body',
        'upper_lower',
        'hybrid',
        'push_pull_legs',
        'specialized',
        'sport_support',
      ]),
      resistance_frequency: z.number().int().nonnegative(),
      conditioning_frequency: z.number().int().nonnegative(),
      cycle_length_days: z.number().int().positive(),
      volume_strategy: z.enum([
        'conservative',
        'moderate',
        'high',
        'maintenance',
        'adaptive',
      ]),
      intensity_strategy: z.enum([
        'technique_first',
        'moderate_loading',
        'strength_emphasis',
        'hypertrophy_emphasis',
        'mixed',
        'maintenance',
      ]),
      fatigue_strategy: z.enum([
        'none',
        'planned_deload',
        'readiness_triggered',
        'combined',
      ]),
      conditioning_strategy: z.enum([
        'none',
        'health_minimum',
        'fat_loss_support',
        'aerobic_base',
        'sport_support',
        'performance',
        'active_recovery',
        'maintenance',
      ]),
      rationale: z.array(StrategyDecisionSchema),
    }),
    calendar: CalendarSchema,
    phases: z.array(ProgrammePhaseSchema).min(1),
    progression_policy: z.object({
      policy_id: identifier,
      default_model: ProgressionModelSchema,
      success_condition: z.string().min(1),
      hold_condition: z.string().min(1),
      regression_condition: z.string().min(1),
      exercise_overrides: z.array(
        z.object({
          override_id: identifier,
          exercise_id: identifier,
          model: ProgressionModelSchema,
          rationale: z.array(z.string()),
        }),
      ),
      rationale: z.array(z.string()),
    }),
    fatigue_management_policy: z.object({
      strategy: z.enum([
        'planned_deload',
        'readiness_triggered',
        'combined',
        'none',
      ]),
      planned_deload_weeks: z.array(z.number().int().positive()),
      deload_adjustments: z.object({
        volume_factor: factor.optional(),
        intensity_factor: factor.optional(),
        effort_factor: factor.optional(),
        conditioning_factor: factor.optional(),
      }),
      readiness_triggers: z.array(z.string()),
      rationale: z.array(z.string()),
    }),
    substitution_policy: z.object({
      allowed: z.boolean(),
      preserve: z.enum([
        'movement_pattern',
        'primary_muscle',
        'equipment_category',
        'fatigue_profile',
      ]),
      require_same_eligibility_status: z.boolean(),
      rules: z.array(z.string()),
    }),
    conditioning_policy: z.object({
      policy_id: identifier,
      weekly_target_sessions: z.number().int().nonnegative(),
      primary_purpose: z.enum([
        'health',
        'fat_loss_support',
        'aerobic_base',
        'sport_support',
        'performance',
        'active_recovery',
        'maintenance',
      ]),
      preferred_modalities: z.array(z.string()),
      restricted_modalities: z.array(z.string()),
      progression_model: z.enum([
        'duration_first',
        'frequency_first',
        'interval_count_first',
        'density_progression',
        'intensity_progression',
        'pace_or_power_progression',
        'maintenance',
      ]),
      concurrent_training_priority: z.enum([
        'resistance',
        'conditioning',
        'equal',
      ]),
      rationale: z.array(z.string()),
    }),
    assumptions: z.array(PlanningAssumptionSchema),
    review_triggers: z.array(ReviewTriggerSchema),
    validation_summary: z.object({
      passed: z.boolean(),
      status: z.enum(['valid', 'valid_with_warnings', 'invalid']),
      overall_score: z.number().min(0).max(100),
      category_scores: z.record(z.number().min(0).max(100)),
      warnings: z.array(
        z.object({
          code: identifier,
          severity: z.enum(['warning', 'error']),
          message: z.string().min(1),
        }),
      ),
      validation_rule_version: z.string().min(1),
    }),
    generation_metadata: z.object({
      generated_at: isoDateString,
      planner_version: PlannerVersionSchema,
      schema_version: z.literal('2.0'),
      exercise_library_version: z.string().min(1),
      validation_rule_version: z.string().min(1),
      deterministic: z.boolean(),
    }),
  })
  .superRefine((programme, ctx) => {
    if (
      programme.strategy.cycle_length_days !==
      programme.calendar.cycle_length_days
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'strategy and calendar cycle lengths must match',
      });
    }
    if (
      !uniqueBy(programme.phases, (phase) => phase.phase_id) ||
      !uniqueBy(programme.phases, (phase) => phase.phase_number)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'phase IDs and numbers must be unique',
        path: ['phases'],
      });
    }
    programme.phases.forEach((phase, index) => {
      const previous = programme.phases[index - 1];
      if (
        previous &&
        (phase.phase_number <= previous.phase_number ||
          phase.start_week !== previous.end_week + 1)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'phases must be ordered, consecutive, and non-overlapping',
          path: ['phases', index],
        });
      }
    });
    const weeks = programme.phases.flatMap((phase) => phase.weeks);
    if (
      weeks.length !== programme.programme.target_weeks ||
      !uniqueBy(weeks, (week) => week.week_id) ||
      !uniqueBy(weeks, (week) => week.week_number) ||
      weeks.some((week, index) => week.week_number !== index + 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'programme weeks must be unique and consecutive',
        path: ['phases'],
      });
    }
    weeks.forEach((week) => {
      if (
        week.days.length !== programme.calendar.cycle_length_days ||
        week.days.some((day, index) => day.cycle_day !== index + 1) ||
        !uniqueBy(week.days, (day) => day.day_id)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'week days must match the calendar cycle',
          path: ['phases'],
        });
      }
      if (
        programme.calendar.cycle_type === 'weekly' &&
        week.days.some(
          (day, index) =>
            day.day_of_week !== programme.calendar.days[index]?.day_of_week,
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'weekly programme days must align with calendar weekdays',
          path: ['phases'],
        });
      }
    });
    const weekByNumber = new Map(weeks.map((week) => [week.week_number, week]));
    const deloads = programme.fatigue_management_policy.planned_deload_weeks;
    if (!uniqueBy(deloads, (week) => week)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'planned deload weeks must be unique',
      });
    }
    if (
      programme.fatigue_management_policy.strategy === 'none' &&
      deloads.length > 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'none fatigue strategy cannot contain planned deloads',
      });
    }
    if (
      deloads.some(
        (weekNumber) => weekByNumber.get(weekNumber)?.week_type !== 'deload',
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'planned deload weeks must exist and be typed deload',
      });
    }
    const progressionReferences = new Set([
      programme.progression_policy.policy_id,
      ...programme.progression_policy.exercise_overrides.map(
        (override) => override.override_id,
      ),
    ]);
    weeks
      .flatMap((week) => week.days)
      .forEach((day) => {
        day.exercises.forEach((exercise) => {
          if (!progressionReferences.has(exercise.progression_rule_id)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'exercise progression_rule_id must reference a policy',
            });
          }
        });
        day.conditioning.forEach((item) => {
          if (
            item.progression_policy_id !==
            programme.conditioning_policy.policy_id
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                'conditioning progression_policy_id must reference policy',
            });
          }
        });
      });
  });
