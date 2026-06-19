import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type {
  LongitudinalOdinProgramme,
  VersionedOdinProgramme,
} from '../../domain/programme/programme.types.js';
import type { DAYS_OF_WEEK } from '../../domain/shared/domain-enums.js';

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
export type ProgrammeCalendar = LongitudinalOdinProgramme['calendar'];
export type ProgrammeStrategyV2 = LongitudinalOdinProgramme['strategy'];
export type CalendarSessionType =
  ProgrammeCalendar['days'][number]['planned_session_type'];
export type CalendarSessionKind = NonNullable<
  ProgrammeCalendar['days'][number]['session_kind']
>;
export type DemandLevel = 'none' | 'low' | 'moderate' | 'high';

export type DemandProfile = {
  systemic: DemandLevel;
  upper_body: DemandLevel;
  lower_body: DemandLevel;
  push: DemandLevel;
  pull: DemandLevel;
  hinge: DemandLevel;
  knee_dominant: DemandLevel;
  impact: DemandLevel;
};

export type PlannedCalendarDay = {
  cycle_day: number;
  day_of_week?: DayOfWeek;
  session_type: CalendarSessionType;
  session_kind: CalendarSessionKind;
  emphasis?: string;
  session_label: string;
  demand_profile: DemandProfile;
};

export type CalendarCandidate = {
  candidate_id: string;
  cycle_type: 'weekly' | 'rolling';
  cycle_length_days: number;
  days: PlannedCalendarDay[];
  exceptions: CalendarException[];
};

export type CalendarConstraintFailure = {
  code: string;
  message: string;
  affected_cycle_days: number[];
};

export type CalendarException = {
  code: string;
  severity: 'information' | 'warning';
  message: string;
  affected_cycle_days: number[];
  reason: string;
};

export type RejectedCalendarCandidate = {
  candidate_id: string;
  failures: CalendarConstraintFailure[];
};

export type CalendarDecision = {
  code: string;
  selected_value: string;
  reason: string;
  source_fields: string[];
  confidence: 'low' | 'moderate' | 'high';
};

export type CalendarScoreBreakdown = {
  availability_fit: number;
  preferred_day_fit: number;
  fatigue_distribution: number;
  movement_overlap: number;
  sport_interference: number;
  rest_distribution: number;
  schedule_simplicity: number;
};

export type ScoredCalendarCandidate = CalendarCandidate & {
  score: number;
  score_breakdown: CalendarScoreBreakdown;
  maximum_consecutive_demanding_days: number;
  movement_overlap_penalty: number;
  sport_interference_penalty: number;
  preferred_day_fit: number;
};

export type PlannedCalendarResult = {
  calendar: ProgrammeCalendar;
  selected_candidate_id: string;
  score: number;
  rationale_codes: string[];
  decisions: CalendarDecision[];
  exceptions: CalendarException[];
  rejected_candidates: RejectedCalendarCandidate[];
};

export type CalendarPlannerInput = {
  profile: NormalizedAthleteProfile;
  strategy: Pick<
    ProgrammeStrategyV2,
    | 'split_type'
    | 'resistance_frequency'
    | 'conditioning_frequency'
    | 'cycle_length_days'
  >;
  cycleAnchorDate: string;
};

export type CalendarValidationInput = {
  programme: Extract<VersionedOdinProgramme, { schema_version: '2.0' }>;
  profile: NormalizedAthleteProfile;
};
