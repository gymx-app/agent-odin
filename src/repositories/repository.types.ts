import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import type { AthleteGoalSchema } from '../domain/shared/domain-enums.js';
import type { RefinementMetadata } from '../llm/refinement.types.js';

type AthleteGoal = typeof AthleteGoalSchema._type;

export type ProgrammeStatus = 'draft' | 'active' | 'archived';
export type ProgrammeSource = 'deterministic' | 'llm_refined';

export type SavedProgramme = {
  id: string;
  userId: string;
  version: number;
  name: string;
  goalType: AthleteGoal;
  status: ProgrammeStatus;
  source: ProgrammeSource;
  programme: OdinProgramme;
  validation: ProgrammeValidationReport;
  refinement: RefinementMetadata;
};

export type ProgrammeCreateInput = {
  userId: string;
  replaceExistingDraft: boolean;
  status: ProgrammeStatus;
  source: ProgrammeSource;
  programme: OdinProgramme;
  validation: ProgrammeValidationReport;
  refinement: RefinementMetadata;
};

export type AgentRunStatus = 'started' | 'succeeded' | 'failed';

export type AgentRun = {
  id: string;
  userId: string;
  requestId: string;
};
