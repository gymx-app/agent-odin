import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type {
  DeterministicRepairOperation,
  ProgrammeValidationReport,
} from '../validation/validation.types.js';

export type RepairEligibility =
  | 'repairable'
  | 'non_repairable'
  | 'conditionally_repairable';

export type ProgrammeRepairInput = {
  programme: LongitudinalOdinProgramme;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  validation: ProgrammeValidationReport;
};

export type ProgrammeRepairResult = {
  programme: LongitudinalOdinProgramme;
  attempted: boolean;
  applied: boolean;
  operations: DeterministicRepairOperation[];
  rejection_reason?: string;
};
