import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type {
  MovementPattern,
  MuscleGroup,
} from '../../domain/exercise/exercise-taxonomy.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';

export type TrainingStrategyV2 = LongitudinalOdinProgramme['strategy'];
export type ProgrammePhase = LongitudinalOdinProgramme['phases'][number];
export type ProgrammeWeek = ProgrammePhase['weeks'][number];
export type ProgrammeDay = ProgrammeWeek['days'][number];
export type SessionTrainingBudget = NonNullable<
  ProgrammeDay['training_budget']
>;
export type ExercisePrescription = ProgrammeDay['exercises'][number];
export type SessionKind = NonNullable<
  ProgrammeDay['session_metadata']
>['session_kind'];

export type MovementSlotV2 = {
  slot_id: string;
  movement_pattern: MovementPattern;
  allowed_substitution_patterns: MovementPattern[];
  target_muscle_groups: MuscleGroup[];
  sequence_role: ExercisePrescription['sequence_role'];
  priority: number;
  required: boolean;
  set_budget: number;
  rep_zone: { min: number; max: number };
  target_rpe: number;
  rpe_ceiling: number;
  fatigue_budget: {
    systemic: 'low' | 'moderate' | 'high';
    local: 'low' | 'moderate' | 'high';
    grip: 'low' | 'moderate' | 'high';
    lower_back: 'low' | 'moderate' | 'high';
  };
  progression_policy_id: string;
};

export type PriorExerciseContext = {
  by_slot_id: Record<string, string>;
  phase_id?: string;
};

export type ExerciseCandidate = {
  exercise: Exercise;
  status: 'eligible' | 'modifiable';
  warnings: string[];
  restriction_tags: string[];
  score: number;
  rationale_codes: string[];
};

export type SessionDurationEstimate = {
  estimated_duration_min: number;
  working_time_min: number;
  rest_time_min: number;
  setup_transition_min: number;
  warmup_allowance_min: number;
  cooldown_allowance_min: number;
};

export type PlannedResistanceSession = {
  day: ProgrammeDay;
  week_type: ProgrammeWeek['week_type'];
  strategy?: TrainingStrategyV2;
  movement_slots: MovementSlotV2[];
  selected_exercise_ids: string[];
  rationale_codes: string[];
  duration: SessionDurationEstimate;
};

export type ResistanceSessionBuilderInput = {
  profile: NormalizedAthleteProfile;
  strategy: TrainingStrategyV2;
  phase: Omit<ProgrammePhase, 'weeks'>;
  week: ProgrammeWeek;
  calendar_day: ProgrammeDay;
  session_budget: SessionTrainingBudget;
  exercises: Exercise[];
  prior_programme_context?: PriorExerciseContext;
};
