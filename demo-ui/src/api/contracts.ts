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
export type RefinementMode =
  | 'deterministic'
  | 'llm_optional'
  | 'llm_required';
export type PlannerVersion = 'legacy_v1' | 'longitudinal_v1';

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

export type ExerciseSet = {
  set_number: number;
  target_reps: number;
  target_rpe: number;
  rpe_ceiling: number;
  rest_seconds: number;
  set_type: 'working' | 'backoff' | 'calibration';
};

export type ProgrammeExercise = {
  display_order: number;
  exercise_id: string;
  exercise_name: string;
  tags: string[];
  coaching_cues: string[];
  warnings: string[];
  sets: ExerciseSet[];
  progression_bounds: { rep_min: number; rep_max: number };
  progression_rule: string;
  equipment: string[];
  movement_patterns: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
};

export type ProgrammeDay = {
  day_of_week: string;
  workout_type: 'workout' | 'liss' | 'rest';
  title: string;
  subtitle: string;
  duration_min: number | null;
  tags: string[];
  has_warmup: boolean;
  liss_content: string | null;
  cooldown_items: Array<{
    item_key: string;
    label: string;
    detail: string;
    display_order: number;
  }>;
  exercises: ProgrammeExercise[];
};

export type OdinProgramme = {
  programme: {
    name: string;
    goal_type: AthleteGoal;
    goal_description: string;
    start_weight_kg: number;
    target_weight_kg: number;
    target_weeks: number;
    available_days: number;
    equipment: Equipment;
    started_at: string;
  };
  config: {
    start_date: string;
    phase_weeks: number[];
    min_active_days: number;
    total_phases: number;
  };
  phases: Array<{
    phase_number: number;
    name: string;
    goal: string;
    weeks_count: number;
    intensity_level: number;
    volume_level: number;
    progression_intent: string;
  }>;
  phase_week_templates: Array<{
    phase_number: number;
    days: ProgrammeDay[];
  }>;
  warmup_items: Array<{
    item_key: string;
    label: string;
    detail: string;
    display_order: number;
  }>;
  assumptions: string[];
  review_triggers: string[];
  validation_summary: {
    passed: boolean;
    scores: Record<string, number>;
    warnings: Array<{
      code: string;
      severity: 'info' | 'warning' | 'error';
      message: string;
    }>;
  };
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
  planner_version: 'longitudinal_v1';
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

export type ProgrammePreviewResponse = {
  source: 'deterministic' | 'llm_refined';
  planner_version: PlannerVersion;
  schema_version: '1.0' | '2.0';
  programme: OdinProgramme | LongitudinalOdinProgramme;
  validation: ProgrammeValidation;
  refinement: RefinementMetadata;
  generation: Record<string, unknown>;
};

export const isLegacyProgramme = (
  programme: ProgrammePreviewResponse['programme'],
): programme is OdinProgramme => 'phase_week_templates' in programme;

export const isLongitudinalProgramme = (
  programme: ProgrammePreviewResponse['programme'],
): programme is LongitudinalOdinProgramme =>
  'schema_version' in programme &&
  (programme as LongitudinalOdinProgramme).schema_version === '2.0';

export const isLegacyResponse = (
  data: ProgrammePreviewResponse,
): data is ProgrammePreviewResponse & { programme: OdinProgramme } =>
  data.planner_version === 'legacy_v1' && data.schema_version === '1.0';

export const isLongitudinalResponse = (
  data: ProgrammePreviewResponse,
): data is ProgrammePreviewResponse & {
  programme: LongitudinalOdinProgramme;
} =>
  data.planner_version === 'longitudinal_v1' && data.schema_version === '2.0';

export type SuccessEnvelope<T> = { success: true; data: T };
export type ErrorEnvelope = {
  success: false;
  error: { code: string; message: string; details: unknown | null };
};
