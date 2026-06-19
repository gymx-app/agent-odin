import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type {
  ExercisePrescription,
  PlannedResistanceSession,
} from '../sessions/session.types.js';
import type { PlannedWarmup } from '../warmup/warmup.types.js';

export type SequenceException = {
  code: string;
  severity: 'information' | 'warning';
  affected_exercise_ids: string[];
  reason: string;
};

export type SequenceCandidate = {
  candidate_id: string;
  prescriptions: ExercisePrescription[];
  exception_codes: string[];
};

export type SequenceConstraintViolation = {
  code: string;
  kind:
    | 'hard_invalidity'
    | 'performance_compromise'
    | 'technical_quality_compromise'
    | 'unjustified_fatigue';
  affected_exercise_ids: string[];
};

export type SequenceScore = {
  total: number;
  primary_position: number;
  fatigue_penalty: number;
  equipment_transitions: number;
  ordering_changes: number;
};

export type ExerciseSequencingResult = {
  exercises: ExercisePrescription[];
  selected_candidate_id: string;
  sequence_exceptions: SequenceException[];
  rejected_candidates: Array<{
    candidate_id: string;
    violations: SequenceConstraintViolation[];
  }>;
  transition_count: number;
  rationale_codes: string[];
};

export type ExerciseSequencingInput = {
  profile: NormalizedAthleteProfile;
  session: PlannedResistanceSession;
  exercises: Exercise[];
  warmup: PlannedWarmup;
};
