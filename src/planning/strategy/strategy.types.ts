import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';

export type TrainingStrategyV2 = LongitudinalOdinProgramme['strategy'];
export type ProgrammeCalendar = LongitudinalOdinProgramme['calendar'];
export type StrategyDecision = TrainingStrategyV2['rationale'][number];

export type StrategyCandidate = {
  candidate_id: string;
  strategy: Omit<TrainingStrategyV2, 'rationale'>;
  complexity: number;
  exceptions: string[];
};

export type RejectedStrategyCandidate = {
  candidate_id: string;
  reasons: string[];
};

export type StrategyScoreBreakdown = {
  goal_alignment: number;
  training_status_fit: number;
  calendar_compatibility: number;
  recovery_fit: number;
  energy_availability_fit: number;
  sport_compatibility: number;
  programme_horizon_fit: number;
  complexity_adherence_fit: number;
};

export type ScoredStrategyCandidate = StrategyCandidate & {
  score: number;
  score_breakdown: StrategyScoreBreakdown;
  calendar_compatibility: number;
  recovery_fit: number;
  progression_simplicity: number;
};

export type ProgrammeStrategyResult = {
  strategy: TrainingStrategyV2;
  selected_candidate_id: string;
  score: number;
  rationale: StrategyDecision[];
  rejected_candidates: RejectedStrategyCandidate[];
};

export type StrategySelectorV2Input = {
  profile: NormalizedAthleteProfile;
  calendar: ProgrammeCalendar;
};
