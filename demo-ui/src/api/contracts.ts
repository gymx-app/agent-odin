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
  status: 'accepted' | 'not_requested' | 'fallback';
  reason_code: string | null;
  model: string | null;
  prompt_version: string | null;
  schema_version: number | null;
  provider_response_id?: string | null;
  input_token_count?: number | null;
  output_token_count?: number | null;
  accepted_operation_count?: number;
  rejected_operation_count?: number;
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

export type ProgrammePreviewResponse = {
  source: 'deterministic' | 'llm_refined';
  planner_version: PlannerVersion;
  schema_version: '1.0' | '2.0';
  programme:
    | OdinProgramme
    | {
        schema_version: '2.0';
        planner_version: 'longitudinal_v1';
        programme: {
          name: string;
          goal_type: AthleteGoal;
          goal_description: string;
          target_weeks: number;
        };
        phases: Array<{
          phase_number: number;
          name: string;
          weeks_count: number;
          weeks: unknown[];
        }>;
        [key: string]: unknown;
      };
  validation: ProgrammeValidation;
  refinement: RefinementMetadata;
  generation: Record<string, unknown>;
};

export type SuccessEnvelope<T> = { success: true; data: T };
export type ErrorEnvelope = {
  success: false;
  error: { code: string; message: string; details: unknown | null };
};
