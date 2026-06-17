import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { MovementPattern } from '../domain/exercise/exercise-taxonomy.js';

export type SplitType =
  | 'full_body'
  | 'upper_lower'
  | 'hybrid'
  | 'push_pull_legs';

export type VolumeBias = 'low' | 'moderate' | 'high';
export type IntensityBias = 'low' | 'moderate' | 'high';

export type ProgrammeStrategy = {
  goal: NormalizedAthleteProfile['source']['goal'];
  split_type: SplitType;
  resistance_days: number;
  liss_days: number;
  rest_days: number;
  programme_weeks: number;
  progression_model: 'double_progression';
  default_rpe_range: {
    min: number;
    max: number;
  };
  volume_bias: VolumeBias;
  intensity_bias: IntensityBias;
  rationale_codes: string[];
};

export type SessionKind =
  | 'full_body'
  | 'upper'
  | 'lower'
  | 'push'
  | 'pull'
  | 'legs'
  | 'liss'
  | 'rest';

export type WeekSession = {
  kind: SessionKind;
  emphasis?: string;
};

export type MovementSlotPriority = 'primary' | 'secondary' | 'accessory';

export type RepZone = {
  min: number;
  max: number;
};

export type MovementSlot = {
  slot_id: string;
  movement_pattern: MovementPattern;
  priority: MovementSlotPriority;
  required: boolean;
  allowed_substitution_patterns: MovementPattern[];
  set_budget: number;
  rep_zone: RepZone;
  target_rpe_range: {
    min: number;
    max: number;
  };
};

export type FilledMovementSlot = {
  slot: MovementSlot;
  exercise: Exercise;
  status: 'eligible' | 'modifiable';
  warnings: string[];
};

export type BuildBaselineProgrammeOptions = {
  startDate?: string;
};
