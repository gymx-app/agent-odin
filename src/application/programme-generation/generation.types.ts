import type { AthleteInput } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { Logger } from '../../infrastructure/logging/logger.js';
import type { ProgrammeRefinementProvider } from '../../llm/programme-refinement-provider.js';
import type { RefinementMode } from '../../llm/refinement.types.js';
import type {
  ProgrammeCreateInput,
  SavedProgramme,
} from '../../repositories/repository.types.js';

export type GenerateProgrammeOptions = {
  replace_existing_draft: boolean;
  refinement_mode: RefinementMode;
  idempotencyKey?: string;
  endpoint?: string;
};

export type GenerateProgrammeContext = {
  requestId: string;
  refinementProvider?: ProgrammeRefinementProvider;
  configuredModel?: string | null;
  refinementUnavailableReason?:
    | 'LLM_REFINEMENT_DISABLED'
    | 'OPENAI_CONFIGURATION_MISSING';
  logger?: Logger;
  generationTimeoutMs?: number;
  athleteProfiles: {
    getByUserId: (userId: string) => Promise<AthleteInput>;
  };
  exercises: {
    loadActiveApproved: () => Promise<Exercise[]>;
  };
  programmes: {
    createWithVersion: (input: ProgrammeCreateInput) => Promise<SavedProgramme>;
    getById: (
      userId: string,
      programmeId: string,
    ) => Promise<SavedProgramme | null>;
  };
  agentRuns: {
    start: (
      userId: string,
      requestId: string,
      inputSummary: {
        goal: string;
        fitness_level: string;
        available_days: number;
        session_duration: number;
        equipment: string;
        has_inbody: boolean;
        injury_count: number;
      },
    ) => Promise<{ id: string }>;
    markSucceeded: (
      runId: string,
      outputReference: Record<string, unknown>,
      validationSummary: Record<string, unknown>,
      durationMs: number,
    ) => Promise<void>;
    markFailed: (
      runId: string,
      errorCode: string,
      errorMessage: string,
      durationMs: number,
    ) => Promise<void>;
  };
  idempotency?: {
    claim: (
      userId: string,
      endpoint: string,
      idempotencyKey: string,
      requestHash: string,
    ) => Promise<
      | { type: 'started' }
      | { type: 'replay'; responseReference: Record<string, unknown> }
    >;
    markFailed: (
      userId: string,
      endpoint: string,
      idempotencyKey: string,
      requestHash: string,
    ) => Promise<void>;
  };
};

export type GenerateProgrammeResult = {
  saved: SavedProgramme;
  replayed: boolean;
};
