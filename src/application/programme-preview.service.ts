import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Logger } from '../infrastructure/logging/logger.js';
import type { ProgrammeRefinementProvider } from '../llm/programme-refinement-provider.js';
import type {
  RefinementMetadata,
  RefinementMode,
} from '../llm/refinement.types.js';
import { normalizeAthlete } from '../normalization/athlete-normalizer.js';
import { buildBaselineProgramme } from '../planning/baseline-programme-planner.js';
import { odinError } from '../shared/errors/odin-errors.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../validation/programme-validator.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { toSafeGenerationError } from './programme-generation/generation-errors.js';
import { refineProgramme } from './programme-refinement.service.js';

export type ProgrammePreviewResult = {
  source: 'deterministic' | 'llm_refined';
  programme: OdinProgramme;
  validation: ProgrammeValidationReport;
  refinement: RefinementMetadata;
};

export type ProgrammePreviewContext = {
  requestId: string;
  exercises: Exercise[];
  refinementProvider?: ProgrammeRefinementProvider;
  configuredModel?: string | null;
  refinementUnavailableReason?:
    | 'LLM_REFINEMENT_DISABLED'
    | 'OPENAI_CONFIGURATION_MISSING';
  logger?: Logger;
  generationTimeoutMs?: number;
};

export const previewProgramme = async (
  athlete: AthleteInput,
  refinementMode: RefinementMode,
  context: ProgrammePreviewContext,
): Promise<ProgrammePreviewResult> => {
  const deadline = Date.now() + (context.generationTimeoutMs ?? 60_000);
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
    operation: () => Promise<T> | T,
  ): Promise<T> => {
    const startedAt = Date.now();
    try {
      return await operation();
    } finally {
      context.logger?.info('preview stage completed', {
        requestId: context.requestId,
        stage,
        durationMs: Date.now() - startedAt,
      });
    }
  };

  try {
    const normalized = await timed('athlete_normalization', () =>
      normalizeAthlete(athlete),
    );
    assertWithinDeadline();
    const baseline = await timed('planner', () =>
      buildBaselineProgramme(normalized, context.exercises),
    );
    const baselineValidation = await timed('validator', () =>
      validateProgramme(baseline, normalized, context.exercises),
    );

    if (!baselineValidation.passed) {
      throw odinError(
        'GENERATED_PROGRAMME_INVALID',
        'Generated programme failed validation.',
        422,
        {
          status: baselineValidation.status,
          summary: baselineValidation.summary,
        },
      );
    }

    assertWithinDeadline();
    const refinementResult = await timed('llm_refinement', () =>
      refineProgramme({
        mode: refinementMode,
        baseline,
        baselineValidation,
        profile: normalized,
        exercises: context.exercises,
        configuredModel: context.configuredModel ?? null,
        unavailableReason:
          context.refinementUnavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
        requestId: context.requestId,
        ...(context.refinementProvider
          ? { provider: context.refinementProvider }
          : {}),
      }),
    );
    assertWithinDeadline();

    return {
      source: refinementResult.source,
      programme: applyValidationSummary(
        refinementResult.programme,
        refinementResult.validation,
      ),
      validation: refinementResult.validation,
      refinement: refinementResult.refinement,
    };
  } catch (error) {
    throw toSafeGenerationError(error);
  }
};
