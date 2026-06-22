import { z } from 'zod';
import {
  AthleteGoalSchema,
  DayOfWeekSchema,
} from '../../domain/shared/domain-enums.js';
import {
  CalendarSchema,
  ProgrammePhaseSchema,
} from '../../domain/programme/longitudinal-programme.schema.js';

const identifier = z.string().min(1).max(100);
const conciseName = z.string().min(1).max(60);
const factor = z.number().min(0.5).max(1.5);
const confidence = z.enum(['low', 'moderate', 'high']);
const direction = z.enum(['decrease', 'maintain', 'increase', 'wave']);

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

const StrategyDecisionSchema = z.object({
  code: identifier,
  selected_value: z.string().min(1),
  reason: z.string().min(1),
  source_fields: z.array(z.string().min(1)),
  confidence,
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

const PhaseSkeletonSchema = z.object({
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
});

export const AiStrategyOutputSchema = z.object({
  programme: z.object({
    name: conciseName,
    goal_type: AthleteGoalSchema,
    goal_description: z.string().min(1),
    target_weeks: z.number().int().positive(),
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
  phase_skeletons: z.array(PhaseSkeletonSchema).min(1),
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
});

export const AiPhaseOutputSchema = ProgrammePhaseSchema;
