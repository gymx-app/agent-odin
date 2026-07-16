import { LongitudinalOdinProgrammeSchema } from '../../src/domain/programme/programme.schema.js';

const exercise = {
  prescription_id: 'foundation-goblet-squat',
  exercise_id: 'dumbbell_goblet_squat',
  exercise_name: 'Dumbbell Goblet Squat',
  display_order: 1,
  set_structure: { type: 'straight' as const, rationale_codes: [] },
  sequence_role: 'primary' as const,
  priority: 1,
  weight_kg: null,
  tags: ['squat'],
  coaching_cues: ['Keep the whole foot planted.'],
  warnings: [],
  sets: [1, 2, 3].map((set_number) => ({
    set_number,
    set_type:
      set_number === 1 ? ('calibration' as const) : ('working' as const),
    target_reps: 10,
    target_rpe: 7,
    rpe_ceiling: 8,
    rest_seconds: 90,
  })),
  progression_bounds: {
    rep_min: 8,
    rep_max: 12,
    load_increment_type: 'smallest_available' as const,
  },
  progression_rule_id: 'default-progression',
  substitution_group_id: 'sub-squat_loaded',
  substitution_options: {
    approved_exercise_ids: ['bodyweight_squat'],
    preserve: 'movement_pattern' as const,
  },
  user_progression_rule:
    'Increase target reps after completing all prescribed sets at or below the RPE ceiling.',
  equipment: ['dumbbell'],
  movement_patterns: ['squat'],
  primary_muscles: ['quadriceps'],
  secondary_muscles: ['glutes'],
  sequencing_rationale: ['Primary lower-body pattern.'],
};

const conditioning = {
  conditioning_id: 'foundation-walk',
  display_order: 1,
  conditioning_type: 'low_intensity_steady_state' as const,
  activity_id: 'incline_walking' as const,
  activity_name: 'Incline Walk',
  purpose: 'Build an aerobic base.',
  duration_min: 25,
  intensity: {
    method: 'talk_test' as const,
    target_label: 'Comfortable conversational pace',
  },
  impact_level: 'low' as const,
  fatigue_cost: 'low' as const,
  placement: 'standalone' as const,
  interference_risk: 'low' as const,
  progression_policy_id: 'conditioning-default',
  rationale: ['Low interference with resistance sessions.'],
};

const calendarDays = [
  ['MON', 'resistance', 'Full Body'],
  ['TUE', 'conditioning', 'Aerobic Base'],
  ['WED', 'rest', 'Rest'],
  ['THU', 'resistance', 'Full Body'],
  ['FRI', 'rest', 'Rest'],
  ['SAT', 'resistance', 'Full Body'],
  ['SUN', 'rest', 'Rest'],
] as const;

const programmeDays = (weekNumber: number) =>
  calendarDays.map(([day_of_week, day_type, title], index) => {
    const resistance = day_type === 'resistance';
    const conditioningDay = day_type === 'conditioning';
    const rest = day_type === 'rest';
    return {
      day_id: `week-${weekNumber}-day-${index + 1}`,
      cycle_day: index + 1,
      day_of_week,
      day_type,
      title,
      estimated_duration_min: rest ? null : resistance ? 45 : 25,
      maximum_duration_min: rest ? null : resistance ? 60 : 35,
      fatigue_classification: rest
        ? ('none' as const)
        : resistance
          ? ('moderate' as const)
          : ('low' as const),
      movement_emphasis: resistance ? ['full_body'] : [],
      warmup: resistance
        ? [
            {
              warmup_id: `week-${weekNumber}-day-${index + 1}-pulse`,
              display_order: 1,
              component_type: 'pulse_raiser' as const,
              activity_name: 'Easy Cycle',
              duration_seconds: 300,
              purpose: 'Raise body temperature.',
              rationale_codes: ['GENERAL_PULSE_RAISER_SELECTED'],
            },
            {
              warmup_id: `week-${weekNumber}-day-${index + 1}-rehearsal`,
              display_order: 2,
              component_type: 'movement_rehearsal' as const,
              activity_name: 'Squat Pattern Rehearsal',
              repetitions: 8,
              intensity: 'Comfortable range',
              purpose: 'Rehearse the selected squat pattern.',
              rationale_codes: ['SQUAT_PATTERN_PREPARED'],
            },
            {
              warmup_id: `week-${weekNumber}-day-${index + 1}-ramp`,
              display_order: 3,
              component_type: 'ramp_up_set' as const,
              activity_name: 'Dumbbell Goblet Squat Ramp-up',
              repetitions: 8,
              intensity: 'Very light',
              purpose: 'Prepare for the first priority exercise.',
              related_exercise_id: 'dumbbell_goblet_squat',
              rationale_codes: ['FIRST_PRIORITY_EXERCISE_RAMP_UP'],
            },
          ]
        : [],
      exercises: resistance ? [{ ...exercise }] : [],
      conditioning: conditioningDay ? [{ ...conditioning }] : [],
      cooldown: resistance
        ? [
            {
              cooldown_id: `week-${weekNumber}-day-${index + 1}-cooldown-1`,
              display_order: 1,
              activity_name: "Child's Pose",
              exercise_id: 'child_pose',
              duration_seconds: 20,
              purpose: 'Kneel and reach arms forward on the floor, lower hips toward heels.',
            },
            {
              cooldown_id: `week-${weekNumber}-day-${index + 1}-cooldown-2`,
              display_order: 2,
              activity_name: 'Standing Quad Stretch',
              exercise_id: 'standing_quad_stretch',
              duration_seconds: 20,
              purpose: 'Balance on one leg, pull heel toward glute until you feel the front of your thigh pull.',
            },
            {
              cooldown_id: `week-${weekNumber}-day-${index + 1}-cooldown-3`,
              display_order: 3,
              activity_name: 'Pigeon Stretch',
              exercise_id: 'pigeon_stretch',
              duration_seconds: 20,
              purpose: 'Place front shin across the mat, lower hips toward the floor.',
            },
          ]
        : [],
      ...(resistance
        ? {
            session_metadata: {
              session_id: `session-${weekNumber}-${index + 1}`,
              session_kind: 'full_body' as const,
              objective: 'Build repeatable full-body resistance quality.',
              phase_objective: 'Establish technique and training consistency.',
              rationale_codes: ['SESSION_VOLUME_BUDGET_SATISFIED'],
              duration_breakdown: {
                working_time_min: 3,
                rest_time_min: 5,
                setup_transition_min: 2,
                warmup_allowance_min: 8,
                cooldown_allowance_min: 5,
              },
              sequence_exceptions: [],
            },
          }
        : {}),
    };
  });

const weeks = [1, 2, 3, 4].map((week_number) => ({
  week_id: `foundation-week-${week_number}`,
  week_number,
  week_type:
    week_number === 1
      ? ('introduction' as const)
      : week_number === 4
        ? ('maintenance' as const)
        : ('loading' as const),
  objective:
    week_number === 4
      ? 'Consolidate and recover.'
      : 'Build repeatable quality.',
  planned_volume_factor: week_number === 4 ? 0.7 : 1,
  planned_intensity_factor: week_number === 4 ? 0.8 : 1,
  planned_effort_factor: week_number === 4 ? 0.8 : 1,
  days: programmeDays(week_number),
  progression_notes: ['Keep all work at or below the RPE ceiling.'],
  review_triggers: [],
  planning_metadata: {
    muscle_group_budgets: [
      {
        muscle_group: 'quadriceps',
        direct_set_target: 6,
        indirect_set_credit: 0,
        minimum_effective_target: 4,
        maximum_recoverable_target: 10,
        priority: 'moderate' as const,
        rationale_codes: ['RECENT_VOLUME_UNKNOWN'],
      },
    ],
    movement_pattern_budgets: [
      {
        movement_pattern: 'squat',
        set_target: 6,
        priority: 'high' as const,
        rationale_codes: [],
      },
    ],
    intensity_target: {
      rep_emphasis: 'mixed' as const,
      loading_intent:
        week_number === 1 ? ('technique' as const) : ('moderate' as const),
      primary_exercise_target_rpe: 7,
      secondary_exercise_target_rpe: 6.5,
      accessory_target_rpe: 6.5,
      maximum_allowed_rpe: 8,
      failure_exposure_policy: 'none' as const,
      rationale_codes: [],
    },
    progression_policy: {
      model: 'double_progression' as const,
      success_condition: {
        all_sets_completed: true,
        target_reps_met: true,
        maximum_rpe: 8,
      },
      next_action: {
        type: 'increase_reps' as const,
        increment: 'one_rep' as const,
      },
      hold_condition: {
        target_reps_met: true,
        rpe_above_target: true,
      },
      regression_condition: {
        missed_reps: true,
        repeated_exposures: 2,
      },
    },
    fatigue_budget: {
      systemic_target: 'moderate' as const,
      lower_body_target: 'moderate' as const,
      upper_body_target: 'moderate' as const,
      grip_target: 'moderate' as const,
      lower_back_target: 'moderate' as const,
      conditioning_target: 'low' as const,
      rationale_codes: [],
    },
    rationale_codes: [
      week_number === 1
        ? 'INTRODUCTION_WEEK_SELECTED'
        : week_number === 4
          ? 'MAINTENANCE_WEEK_SELECTED'
          : 'LOADING_WEEK_SELECTED',
    ],
  },
}));

export const validLongitudinalProgramme = LongitudinalOdinProgrammeSchema.parse(
  {
    schema_version: '2.0',
    planner_version: 'longitudinal_v1',
    programme: {
      name: 'Foundation General Fitness',
      goal_type: 'fat_loss',
      goal_description: 'Build consistent resistance and aerobic training.',
      start_date: '2026-06-22',
      target_weeks: 4,
      start_weight_kg: 82,
      target_weight_kg: 82,
      status: 'preview',
    },
    athlete_summary: {
      training_status: 'beginner',
      recovery_capacity: 'moderate',
      energy_availability: 'adequate',
      movement_limitation_level: 'none',
      sport_interference_risk: 'low',
      programme_confidence: 'high',
    },
    strategy: {
      primary_objective: 'fat_loss',
      periodization_model: 'simple_progressive',
      progression_model: 'double_progression',
      split_type: 'full_body',
      resistance_frequency: 3,
      conditioning_frequency: 1,
      cycle_length_days: 7,
      volume_strategy: 'conservative',
      intensity_strategy: 'technique_first',
      fatigue_strategy: 'none',
      conditioning_strategy: 'health_minimum',
      rationale: [
        {
          code: 'SPLIT_TYPE_DECISION',
          selected_value: 'full_body',
          reason:
            'At 3 resistance days/week, full body ensures each muscle group is still trained more than once weekly without needing more session-days than available. Frequency is a volume-distribution tool, not independently superior to lower frequency once weekly volume is equated.',
          source_fields: ['available_days_per_week'],
          confidence: 'high' as const,
        },
        {
          code: 'SCHOENFELD_2016_FREQUENCY',
          selected_value: 'full_body',
          reason:
            'Training a muscle group 2+ times/week outperforms 1x/week on hypertrophy when weekly volume is not equated.',
          source_fields: ['available_days_per_week'],
          confidence: 'moderate' as const,
        },
        {
          code: 'SCHOENFELD_2019_FREQUENCY_VOLUME_EQUATED',
          selected_value: 'full_body',
          reason:
            'No significant difference between higher and lower frequency once total weekly volume is equated — this correction is why frequency is treated as a volume-distribution tool rather than cited alone.',
          source_fields: ['available_days_per_week'],
          confidence: 'moderate' as const,
        },
      ],
    },
    calendar: {
      cycle_type: 'weekly',
      cycle_length_days: 7,
      anchor_date: '2026-06-22',
      repeats: true,
      days: calendarDays.map(
        ([day_of_week, planned_session_type, session_label], index) => ({
          cycle_day: index + 1,
          day_of_week,
          planned_session_type,
          session_label,
        }),
      ),
    },
    phases: [
      {
        phase_id: 'foundation',
        phase_number: 1,
        name: 'Foundation',
        phase_type: 'foundation',
        objective: 'Establish technique and training consistency.',
        start_week: 1,
        end_week: 4,
        weeks_count: 4,
        volume_direction: 'maintain',
        intensity_direction: 'maintain',
        effort_direction: 'maintain',
        progression_model: 'double_progression',
        weeks,
        rationale: [],
      },
    ],
    progression_policy: {
      policy_id: 'default-progression',
      default_model: 'double_progression',
      success_condition: 'Complete every set at or below the RPE ceiling.',
      hold_condition: 'Hold the prescription when one set exceeds target RPE.',
      regression_condition: 'Reduce demand after repeated missed targets.',
      exercise_overrides: [],
      rationale: [],
    },
    fatigue_management_policy: {
      strategy: 'none',
      planned_deload_weeks: [],
      deload_adjustments: {},
      readiness_triggers: [],
      rationale: [],
    },
    substitution_policy: {
      allowed: true,
      preserve: 'movement_pattern',
      require_same_eligibility_status: true,
      rules: ['Use approved exercise IDs only.'],
    },
    conditioning_policy: {
      policy_id: 'conditioning-default',
      weekly_target_sessions: 1,
      primary_purpose: 'health',
      preferred_modalities: ['incline_walking'],
      restricted_modalities: [],
      progression_model: 'duration_first',
      concurrent_training_priority: 'resistance',
      rationale: [],
    },
    assumptions: [],
    review_triggers: [],
    validation_summary: {
      passed: true,
      status: 'valid',
      overall_score: 100,
      category_scores: {},
      warnings: [],
      validation_rule_version: 'programme-validation/v2',
    },
    generation_metadata: {
      generated_at: '2026-06-19T05:30:00.000Z',
      planner_version: 'longitudinal_v1',
      schema_version: '2.0',
      exercise_library_version: 'fixture-v1',
      validation_rule_version: 'programme-validation/v2',
      deterministic: true,
    },
  },
);
