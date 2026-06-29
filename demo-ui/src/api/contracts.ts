export type Sex = 'male' | 'female';
export type AthleteGoal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'recomposition'
  | 'strength'
  | 'endurance';
export type Equipment =
  | 'full_gym'
  | 'dumbbells_only'
  | 'bodyweight'
  | 'home_gym';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlannerVersion = 'longitudinal_v1' | 'ai_agent_v1' | 'ai_agent_v2';

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type AthleteInput = {
  name: string;
  age: number;
  sex: Sex;
  current_weight_kg: number;
  target_weight_kg: number;
  height_cm: number;
  goal: AthleteGoal;
  available_days_per_week: number;
  session_duration_min: number;
  equipment: Equipment;
  fitness_level: FitnessLevel;
  injuries: Array<{
    area: string;
    severity: 'avoid' | 'modify';
    notes: string;
  }>;
  inbody: null | {
    body_fat_pct: number;
    smm_kg: number;
    visceral_fat_area: number;
    bmr: number;
    segmental_balance: {
      left_arm: number;
      right_arm: number;
      left_leg: number;
      right_leg: number;
      trunk: number;
    };
  };
  training_history?: {
    years_consistent_training?: number;
    consistency_last_12_weeks?: 'low' | 'moderate' | 'high';
    current_sessions_per_week?: number;
    exercise_competency?: 'novice' | 'competent' | 'advanced';
  };
  nutrition?: {
    calorie_status?: 'deficit' | 'maintenance' | 'surplus' | 'unknown';
    estimated_protein_g_per_day?: number;
  };
  lifestyle?: {
    sleep_hours?: number;
    perceived_stress?: number;
    occupation_type?: 'sedentary' | 'mixed' | 'active' | 'manual';
  };
  sport?: {
    name?: string;
    sessions_per_week?: number;
    intensity?: 'low' | 'moderate' | 'high';
    priority?: 'supporting' | 'equal' | 'primary';
    lower_body_load?: 'low' | 'moderate' | 'high';
  };
  schedule?: {
    available_days?: DayOfWeek[];
    preferred_workout_time?: 'morning' | 'afternoon' | 'evening' | 'night';
  };
};

export type ValidationFinding = {
  code: string;
  severity: 'info' | 'warning' | 'error';
  category: string;
  message: string;
  phase_number: number | null;
  day_of_week: string | null;
  exercise_id: string | null;
  metadata?: Record<string, unknown>;
};

export type ProgrammeValidation = {
  passed: boolean;
  status: 'pass' | 'pass_with_warnings' | 'fail';
  overall_score: number;
  scores: Record<string, number>;
  findings: ValidationFinding[];
  summary: {
    error_count: number;
    warning_count: number;
    info_count: number;
  };
};

export type RefinementMetadata = {
  requested: boolean;
  applied: boolean;
  status: string;
  reason_code: string | null;
  model?: string | null;
  prompt_version?: string | null;
  schema_version?: number | null;
  provider_response_id?: string | null;
  input_token_count?: number | null;
  output_token_count?: number | null;
  accepted_operation_count?: number;
  rejected_operation_count?: number;
  operation_count?: number;
  accepted_operation_types?: string[];
  retry_attempted?: boolean;
};

// --- V2 longitudinal types ---

export type V2ConditioningIntensity = {
  method: string;
  target_min?: number;
  target_max?: number;
  target_label?: string;
};

export type V2WarmupPrescription = {
  warmup_id: string;
  display_order: number;
  component_type: string;
  activity_name: string;
  duration_seconds?: number;
  repetitions?: number;
  intensity?: string;
  purpose: string;
  related_exercise_id?: string;
};

export type V2ExerciseSet = {
  set_number: number;
  set_type: 'working' | 'backoff' | 'calibration';
  target_reps: number;
  target_rpe: number;
  rpe_ceiling: number;
  rest_seconds: number;
};

export type V2ExercisePrescription = {
  prescription_id: string;
  exercise_id: string;
  exercise_name: string;
  display_order: number;
  sequence_role: string;
  priority: number;
  tags: string[];
  coaching_cues: string[];
  warnings: string[];
  sets: V2ExerciseSet[];
  progression_bounds: { rep_min: number; rep_max: number };
  user_progression_rule: string;
  equipment: string[];
  movement_patterns: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  sequencing_rationale: string[];
  weight_kg?: number | null;
};

export type V2ConditioningPrescription = {
  conditioning_id: string;
  display_order: number;
  conditioning_type: string;
  activity_id: string;
  activity_name: string;
  purpose: string;
  duration_min: number;
  intensity: V2ConditioningIntensity;
  intervals?: {
    work_seconds: number;
    recovery_seconds: number;
    interval_count: number;
    work_intensity: V2ConditioningIntensity;
    recovery_intensity: V2ConditioningIntensity;
  };
  impact_level: string;
  fatigue_cost: string;
  placement: string;
  same_day_separation?: { category: string };
  interference_risk: string;
  rationale: string[];
};

export type V2CooldownPrescription = {
  cooldown_id: string;
  display_order: number;
  activity_name: string;
  duration_seconds?: number;
  repetitions?: number;
  purpose: string;
};

export type V2Day = {
  day_id: string;
  cycle_day: number;
  day_of_week?: string;
  day_type: string;
  title: string;
  subtitle?: string;
  estimated_duration_min: number | null;
  maximum_duration_min: number | null;
  fatigue_classification: string;
  movement_emphasis: string[];
  warmup: V2WarmupPrescription[];
  exercises: V2ExercisePrescription[];
  conditioning: V2ConditioningPrescription[];
  cooldown: V2CooldownPrescription[];
  session_metadata?: {
    session_kind: string;
    objective: string;
  };
  is_baseline?: boolean;
};

export type V2Week = {
  week_id: string;
  week_number: number;
  week_type: string;
  objective: string;
  planned_volume_factor: number;
  planned_intensity_factor: number;
  planned_effort_factor: number;
  days: V2Day[];
  progression_notes: string[];
  review_triggers: Array<{ code: string; message: string; trigger_type: string }>;
};

export type V2Phase = {
  phase_id: string;
  phase_number: number;
  name: string;
  phase_type: string;
  objective: string;
  start_week: number;
  end_week: number;
  weeks_count: number;
  volume_direction: string;
  intensity_direction: string;
  effort_direction: string;
  weeks: V2Week[];
  rationale: Array<{
    code: string;
    selected_value: string;
    reason: string;
    source_fields: string[];
    confidence: string;
  }>;
};

export type LongitudinalOdinProgramme = {
  schema_version: '2.0';
  planner_version: 'longitudinal_v1' | 'ai_agent_v1';
  programme: {
    name: string;
    goal_type: string;
    goal_description: string;
    start_date: string;
    target_weeks: number;
    start_weight_kg: number;
    target_weight_kg: number;
    status: string;
  };
  athlete_summary: Record<string, string>;
  strategy: {
    primary_objective: string;
    periodization_model: string;
    progression_model: string;
    split_type: string;
    resistance_frequency: number;
    conditioning_frequency: number;
    cycle_length_days: number;
    volume_strategy: string;
    intensity_strategy: string;
    fatigue_strategy: string;
    conditioning_strategy: string;
  };
  calendar: {
    cycle_type: 'weekly' | 'rolling';
    cycle_length_days: number;
    anchor_date: string;
  };
  phases: V2Phase[];
  conditioning_policy: {
    weekly_target_sessions: number;
    primary_purpose: string;
    preferred_modalities: string[];
  };
  validation_summary: {
    passed: boolean;
    status: string;
    overall_score: number;
    category_scores: Record<string, number>;
    warnings: Array<{ code: string; severity: string; message: string }>;
  };
  [key: string]: unknown;
};

export type StrategyRationaleItem = {
  decision: string;
  value: string;
  reason: string;
  confidence: string;
};

export type DeterministicRationaleItem = {
  area: string;
  detail: string;
};

export type RationaleSummary = {
  ai_strategy: {
    decisions: StrategyRationaleItem[];
    assumptions: Array<{ assumption: string; confidence: string }>;
    key_policies: Array<{ policy: string; detail: string }>;
  };
  deterministic: {
    build_decisions: DeterministicRationaleItem[];
    phase_rationale: Array<{
      phase: string;
      phase_type: string;
      decisions: Array<{ decision: string; value: string; reason: string }>;
    }>;
  };
  combined: string[];
};

export type RepairAttempt = {
  attempt: number;
  errorCodes: string[];
  repaired: boolean;
};

export type AiGenerationMeta = {
  total_input_tokens: number;
  total_output_tokens: number;
  fallback_used: boolean;
  fallback_reason?: string;
};

export type ProgrammePreviewResponse = {
  source: 'deterministic' | 'ai_generated';
  planner_version: PlannerVersion;
  schema_version: '2.0';
  programme: LongitudinalOdinProgramme;
  validation: ProgrammeValidation;
  rationale?: RationaleSummary;
  refinement: RefinementMetadata;
  generation: {
    planner_version: PlannerVersion;
    schema_version: '1.0' | '2.0';
    validation_rule_version: string;
    exercise_library_version: string;
    repair_attempted: boolean;
    repair_applied: boolean;
    repair_log?: RepairAttempt[];
    planner_resolution?: {
      selected_version: string;
      requested_version: string | null;
      fallback_applied: boolean;
      fallback_reason: string | null;
      reason_code: string;
    };
    stage_durations_ms?: Record<string, number>;
    ai_generation?: AiGenerationMeta;
    [key: string]: unknown;
  };
};

export const isLongitudinalProgramme = (
  programme: ProgrammePreviewResponse['programme'],
): programme is LongitudinalOdinProgramme =>
  'schema_version' in programme &&
  (programme as LongitudinalOdinProgramme).schema_version === '2.0';

export type SuccessEnvelope<T> = { success: true; data: T };
export type ErrorEnvelope = {
  success: false;
  error: { code: string; message: string; details: unknown | null };
};

// --- V2 goal-specific types ---

export type GoalParametersV2 = {
  current_body_fat_pct?: number;
  target_body_fat_pct?: number;
  target_muscle_gain_kg?: number;
  timeframe_weeks?: number;
  primary_lift?: 'squat' | 'deadlift' | 'bench_press' | 'overhead_press';
  current_1rm_kg?: number;
  target_1rm_kg?: number;
  endurance_focus?: 'cardio' | 'mobility' | 'general';
};

export type InBodyV2 = {
  body_fat_pct: number;
  smm_kg: number;
  visceral_fat_area: number;
  bmr: number;
};

export type AthleteInputV2 = Omit<AthleteInput, 'inbody'> & {
  inbody: InBodyV2 | null;
  goal_parameters?: GoalParametersV2;
  baseline_path?: 'self_reported' | 'day_one_test' | 'skipped';
  known_lifts?: Array<{ exercise_id: string; weight_kg: number; reps: number }> | null;
};

export type InBodyParseResult = {
  body_fat_pct: number | null;
  smm_kg: number | null;
  body_fat_mass_kg: number | null;
  bmr: number | null;
  visceral_fat_area: number | null;
  total_body_water_l: number | null;
};
