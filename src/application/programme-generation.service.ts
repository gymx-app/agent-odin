import { createHash } from 'node:crypto';
import { AppError } from '../shared/errors/app-error.js';
import { odinError } from '../shared/errors/odin-errors.js';
import { normalizeAthlete } from '../normalization/athlete-normalizer.js';
import { buildBaselineProgramme } from '../planning/baseline-programme-planner.js';
import { PlannerError } from '../planning/planner-errors.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../validation/programme-validator.js';
import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { ProgrammeCreateInput } from '../repositories/repository.types.js';
import type { SavedProgramme } from '../repositories/repository.types.js';
import type { ProgrammeRefinementProvider } from '../llm/programme-refinement-provider.js';
import type { RefinementMode } from '../llm/refinement.types.js';
import { refineProgramme } from './programme-refinement.service.js';

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
  athleteProfiles: {
    getByUserId: (userId: string) => Promise<AthleteInput>;
  };
  exercises: {
    loadActiveApproved: () => Promise<Exercise[]>;
  };
  programmes: {
    assertNoDraft: (userId: string) => Promise<void>;
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
    markSucceeded: (
      userId: string,
      endpoint: string,
      idempotencyKey: string,
      responseReference: Record<string, unknown>,
    ) => Promise<void>;
  };
};

export type GenerateProgrammeResult = {
  saved: SavedProgramme;
  replayed: boolean;
};

const hashRequest = (body: unknown): string =>
  createHash('sha256')
    .update(
      JSON.stringify(body, Object.keys(body as Record<string, unknown>).sort()),
    )
    .digest('hex');

const safeMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Programme generation failed.';

const toSafeAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof PlannerError) {
    if (error.code === 'INVALID_EXERCISE_LIBRARY') {
      return odinError(
        'EXERCISE_LIBRARY_INVALID',
        'Exercise library failed validation.',
        500,
      );
    }

    return odinError(
      'GENERATED_PROGRAMME_INVALID',
      'Generated programme failed deterministic planning.',
      422,
      { planner_code: error.code },
    );
  }

  return odinError(
    'INTERNAL_SERVER_ERROR',
    'Programme generation failed.',
    500,
  );
};

export const generateProgrammeForUser = async (
  userId: string,
  options: GenerateProgrammeOptions,
  context: GenerateProgrammeContext,
): Promise<GenerateProgrammeResult> => {
  const startedAt = Date.now();
  const endpoint = options.endpoint ?? '/api/odin/generate';
  const requestBody = {
    replace_existing_draft: options.replace_existing_draft,
    refinement_mode: options.refinement_mode,
  };

  if (options.idempotencyKey && context.idempotency) {
    const claim = await context.idempotency.claim(
      userId,
      endpoint,
      options.idempotencyKey,
      hashRequest(requestBody),
    );

    if (claim.type === 'replay') {
      const programmeId = claim.responseReference.programme_id;

      if (typeof programmeId !== 'string') {
        throw odinError(
          'PROGRAMME_NOT_FOUND',
          'Idempotent programme reference was not found.',
          404,
        );
      }

      const saved = await context.programmes.getById(userId, programmeId);

      if (!saved) {
        throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
      }

      return { saved, replayed: true };
    }
  }

  const athlete = await context.athleteProfiles.getByUserId(userId);
  const run = await context.agentRuns.start(userId, context.requestId, {
    goal: athlete.goal,
    fitness_level: athlete.fitness_level,
    available_days: athlete.available_days_per_week,
    session_duration: athlete.session_duration_min,
    equipment: athlete.equipment,
    has_inbody: athlete.inbody !== null,
    injury_count: athlete.injuries.length,
  });

  try {
    if (!options.replace_existing_draft) {
      await context.programmes.assertNoDraft(userId);
    }

    const normalized = normalizeAthlete(athlete);
    const exercises = await context.exercises.loadActiveApproved();
    const programme = buildBaselineProgramme(normalized, exercises);
    const validation = validateProgramme(programme, normalized, exercises);

    if (!validation.passed) {
      throw odinError(
        'GENERATED_PROGRAMME_INVALID',
        'Generated programme failed validation.',
        422,
        {
          status: validation.status,
          summary: validation.summary,
        },
      );
    }

    const refinementResult = await refineProgramme({
      mode: options.refinement_mode,
      baseline: programme,
      baselineValidation: validation,
      profile: normalized,
      exercises,
      configuredModel: context.configuredModel ?? null,
      unavailableReason:
        context.refinementUnavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
      requestId: context.requestId,
      ...(context.refinementProvider
        ? { provider: context.refinementProvider }
        : {}),
    });
    const validatedProgramme = applyValidationSummary(
      refinementResult.programme,
      refinementResult.validation,
    );
    const saved = await context.programmes.createWithVersion({
      userId,
      replaceExistingDraft: options.replace_existing_draft,
      status: 'draft',
      source: refinementResult.source,
      programme: validatedProgramme,
      validation: refinementResult.validation,
      refinement: refinementResult.refinement,
    });

    await context.agentRuns.markSucceeded(
      run.id,
      { programme_id: saved.id, version: saved.version },
      {
        status: refinementResult.validation.status,
        overall_score: refinementResult.validation.overall_score,
        summary: refinementResult.validation.summary,
        refinement: refinementResult.refinement,
      },
      Date.now() - startedAt,
    );

    if (options.idempotencyKey && context.idempotency) {
      await context.idempotency.markSucceeded(
        userId,
        endpoint,
        options.idempotencyKey,
        { programme_id: saved.id },
      );
    }

    return { saved, replayed: false };
  } catch (error) {
    const appError = toSafeAppError(error);

    try {
      await context.agentRuns.markFailed(
        run.id,
        appError.code,
        safeMessage(appError),
        Date.now() - startedAt,
      );
    } catch {
      // Preserve the original generation error for callers.
    }

    throw appError;
  }
};
