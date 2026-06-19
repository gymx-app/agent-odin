import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';

export type ConditioningPrescription =
  LongitudinalOdinProgramme['phases'][number]['weeks'][number]['days'][number]['conditioning'][number];
export type ConditioningModality = ConditioningPrescription['activity_id'];
export type ConditioningType = ConditioningPrescription['conditioning_type'];
export type ConditioningRequirement =
  | 'none'
  | 'minimum_health'
  | 'supportive'
  | 'developmental'
  | 'performance'
  | 'maintenance';

export type ConditioningException = {
  code: string;
  severity: 'information' | 'warning';
  message: string;
  affected_day_ids: string[];
  reason: string;
};

export type WeeklyConditioningLoad = {
  week_number: number;
  formal_session_count: number;
  sport_session_count: number;
  low_intensity_minutes: number;
  moderate_intensity_minutes: number;
  high_intensity_minutes: number;
  high_impact_minutes: number;
  sprint_exposure_count: number;
  estimated_fatigue: 'low' | 'moderate' | 'high';
  rationale_codes: string[];
};

export type ConditioningPlanInput = {
  profile: NormalizedAthleteProfile;
  strategy: LongitudinalOdinProgramme['strategy'];
  calendar: LongitudinalOdinProgramme['calendar'];
  phases: LongitudinalOdinProgramme['phases'];
};

export type ConditioningPlanResult = {
  requirement: ConditioningRequirement;
  phases: LongitudinalOdinProgramme['phases'];
  conditioning_policy: LongitudinalOdinProgramme['conditioning_policy'];
  weekly_loads: WeeklyConditioningLoad[];
  exceptions: ConditioningException[];
  rationale_codes: string[];
};
