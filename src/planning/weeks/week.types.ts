import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import type { PhaseArchitecture } from '../phases/phase.types.js';

export type TrainingStrategyV2 = LongitudinalOdinProgramme['strategy'];
export type ProgrammeCalendar = LongitudinalOdinProgramme['calendar'];
export type PlannedProgrammeWeek =
  LongitudinalOdinProgramme['phases'][number]['weeks'][number];
export type ProgrammeDay = PlannedProgrammeWeek['days'][number];
export type WeekPlanningMetadata = PlannedProgrammeWeek['planning_metadata'];

export type WeekPlanningDecision = {
  code: string;
  selected_value: string;
  reason: string;
  source_fields: string[];
  confidence: 'low' | 'moderate' | 'high';
};

export type WeeklyVolumeTarget = {
  week_number: number;
  total_working_sets: number;
  volume_factor: number;
};

export type ProgrammeVolumePlan = {
  weekly_targets: WeeklyVolumeTarget[];
  rationale: WeekPlanningDecision[];
};

export type ProgrammeIntensityPlan = {
  week_targets: Array<{
    week_number: number;
    intensity_factor: number;
    effort_factor: number;
    target: WeekPlanningMetadata['intensity_target'];
  }>;
  rationale: WeekPlanningDecision[];
};

export type ProgrammeProgressionPlan = {
  default_policy: WeekPlanningMetadata['progression_policy'];
  week_transition_rules: string[];
  rationale: WeekPlanningDecision[];
};

export type ProgrammeFatiguePlan = {
  weekly_budgets: Array<
    WeekPlanningMetadata['fatigue_budget'] & { week_number: number }
  >;
  planned_deload_weeks: number[];
  rationale: WeekPlanningDecision[];
};

export type ProgrammeWeekPlanResult = {
  weeks: PlannedProgrammeWeek[];
  phases: Array<PhaseArchitecture & { weeks: PlannedProgrammeWeek[] }>;
  volume_plan: ProgrammeVolumePlan;
  intensity_plan: ProgrammeIntensityPlan;
  progression_plan: ProgrammeProgressionPlan;
  fatigue_plan: ProgrammeFatiguePlan;
  rationale: WeekPlanningDecision[];
};

export type WeekPlannerInput = {
  profile: NormalizedAthleteProfile;
  strategy: TrainingStrategyV2;
  calendar: ProgrammeCalendar;
  phases: PhaseArchitecture[];
  planned_deload_weeks: number[];
};
