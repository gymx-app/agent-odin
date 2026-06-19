import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';

export type TrainingStrategyV2 = LongitudinalOdinProgramme['strategy'];
export type ProgrammeCalendar = LongitudinalOdinProgramme['calendar'];
export type ProgrammePhase = LongitudinalOdinProgramme['phases'][number];
export type PhaseArchitecture = Omit<ProgrammePhase, 'weeks'>;
export type PhaseDecision = PhaseArchitecture['rationale'][number];

export type PhaseTemplate = {
  key: string;
  name: PhaseArchitecture['name'];
  phase_type: PhaseArchitecture['phase_type'];
  objective: string;
  minimum_weeks: number;
  weight: number;
  rationale_code: string;
};

export type ProgrammePhasePlan = {
  phases: PhaseArchitecture[];
  planned_deload_weeks: number[];
  fatigue_management_policy: {
    strategy: TrainingStrategyV2['fatigue_strategy'];
    planned_deload_weeks: number[];
    deload_adjustments: {
      volume_factor?: number;
      intensity_factor?: number;
      effort_factor?: number;
      conditioning_factor?: number;
    };
    readiness_triggers: string[];
    rationale: string[];
  };
  rationale_codes: string[];
};

export type PhasePlannerInput = {
  profile: NormalizedAthleteProfile;
  strategy: TrainingStrategyV2;
  calendar: ProgrammeCalendar;
};
