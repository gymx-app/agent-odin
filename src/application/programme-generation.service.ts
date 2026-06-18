import { odinError } from '../shared/errors/odin-errors.js';
import { normalizeAthlete } from '../normalization/athlete-normalizer.js';
import { buildBaselineProgramme } from '../planning/baseline-programme-planner.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../validation/programme-validator.js';
import { refineProgramme } from './programme-refinement.service.js';
import { hashIdempotentRequest } from '../shared/request-hash.js';
import type {
  GenerateProgrammeContext,
  GenerateProgrammeOptions,
  GenerateProgrammeResult,
} from './programme-generation/generation.types.js';
import {
  safeGenerationErrorMessage,
  toSafeGenerationError,
} from './programme-generation/generation-errors.js';

export type {
  GenerateProgrammeContext,
  GenerateProgrammeOptions,
  GenerateProgrammeResult,
} from './programme-generation/generation.types.js';

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
  const requestHash = hashIdempotentRequest(requestBody);
  const deadline = startedAt + (context.generationTimeoutMs ?? 60_000);
  const assertWithinDeadline = (): void => {
    if (Date.now() > deadline) {
      throw odinError(
        'GENERATION_TIMEOUT',
        'Programme generation exceeded its deadline.',
        504,
      );
    }
  };
  const timed = async <T>(
    stage: string,
    operation: () => Promise<T>,
  ): Promise<T> => {
    const stageStartedAt = Date.now();
    try {
      return await operation();
    } finally {
      context.logger?.info('generation stage completed', {
        requestId: context.requestId,
        stage,
        durationMs: Date.now() - stageStartedAt,
      });
    }
  };

  if (options.idempotencyKey && context.idempotency) {
    const claim = await context.idempotency.claim(
      userId,
      endpoint,
      options.idempotencyKey,
      requestHash,
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

  let run: { id: string } | null = null;
  let persisted = false;

  try {
    const athlete = await timed('athlete_profile_load', () =>
      context.athleteProfiles.getByUserId(userId),
    );
    assertWithinDeadline();
    run = await context.agentRuns.start(userId, context.requestId, {
      goal: athlete.goal,
      fitness_level: athlete.fitness_level,
      available_days: athlete.available_days_per_week,
      session_duration: athlete.session_duration_min,
      equipment: athlete.equipment,
      has_inbody: athlete.inbody !== null,
      injury_count: athlete.injuries.length,
    });
    const normalized = normalizeAthlete(athlete);
    const exercises = await timed('exercise_library_load', () =>
      context.exercises.loadActiveApproved(),
    );
    assertWithinDeadline();
    const programme = await timed('planner', async () =>
      buildBaselineProgramme(normalized, exercises),
    );
    const validation = await timed('validator', async () =>
      validateProgramme(programme, normalized, exercises),
    );

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

    assertWithinDeadline();
    const refinementResult = await timed('llm_refinement', () =>
      refineProgramme({
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
      }),
    );
    const validatedProgramme = applyValidationSummary(
      refinementResult.programme,
      refinementResult.validation,
    );
    assertWithinDeadline();
    const saved = await timed('programme_persistence', () =>
      context.programmes.createWithVersion({
        userId,
        replaceExistingDraft: options.replace_existing_draft,
        status: 'draft',
        source: refinementResult.source,
        programme: validatedProgramme,
        validation: refinementResult.validation,
        refinement: refinementResult.refinement,
        ...(options.idempotencyKey && context.idempotency
          ? {
              idempotency: {
                endpoint,
                key: options.idempotencyKey,
                requestHash,
              },
            }
          : {}),
      }),
    );
    persisted = true;
    assertWithinDeadline();

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

    return { saved, replayed: false };
  } catch (error) {
    const appError = toSafeGenerationError(error);

    if (run) {
      try {
        await context.agentRuns.markFailed(
          run.id,
          appError.code,
          safeGenerationErrorMessage(appError),
          Date.now() - startedAt,
        );
      } catch {
        // Preserve the original generation error for callers.
      }
    }

    if (!persisted && options.idempotencyKey && context.idempotency) {
      try {
        await context.idempotency.markFailed(
          userId,
          endpoint,
          options.idempotencyKey,
          requestHash,
        );
      } catch {
        // A retry can reclaim an expired started key if failure marking fails.
      }
    }

    throw appError;
  }
};
