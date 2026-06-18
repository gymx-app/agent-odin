import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { validateProgramme } from '../validation/programme-validator.js';
import { applyProgrammeRefinement } from '../llm/refinement-applier.js';
import { buildRefinementContext } from '../llm/refinement-context-builder.js';
import { RefinementError, refinementError } from '../llm/refinement-errors.js';
import { compareProgrammeValidation } from '../llm/refinement-policy.js';
import type { ProgrammeRefinementProvider } from '../llm/programme-refinement-provider.js';
import {
  REFINEMENT_PROMPT_VERSION,
  REFINEMENT_SCHEMA_VERSION,
  type RefinementMetadata,
  type RefinementMode,
} from '../llm/refinement.types.js';

export type RefineProgrammeResult = {
  programme: OdinProgramme;
  validation: ProgrammeValidationReport;
  source: 'deterministic' | 'llm_refined';
  refinement: RefinementMetadata;
};

const fallbackMetadata = (
  model: string | null,
  reasonCode: string,
  providerMetadata: Partial<RefinementMetadata> = {},
): RefinementMetadata => ({
  requested: true,
  applied: false,
  status: 'fallback',
  reason_code: reasonCode,
  model,
  prompt_version: REFINEMENT_PROMPT_VERSION,
  schema_version: REFINEMENT_SCHEMA_VERSION,
  accepted_operation_count: 0,
  rejected_operation_count: 0,
  ...providerMetadata,
});

const errorCode = (error: unknown): string =>
  error instanceof RefinementError
    ? error.code
    : 'REFINEMENT_APPLICATION_FAILED';

const isCorrectable = (code: string): boolean =>
  [
    'REFINEMENT_PROPOSAL_INVALID',
    'REFINEMENT_OPERATION_FORBIDDEN',
    'REFINEMENT_EXERCISE_UNKNOWN',
    'REFINEMENT_REFERENCE_INVALID',
    'REFINEMENT_APPLICATION_FAILED',
    'REFINEMENT_VALIDATION_REJECTED',
    'REFINEMENT_SCORE_REJECTED',
  ].includes(code);

export const refineProgramme = async (input: {
  mode: RefinementMode;
  baseline: OdinProgramme;
  baselineValidation: ProgrammeValidationReport;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  provider?: ProgrammeRefinementProvider;
  configuredModel: string | null;
  unavailableReason?:
    | 'LLM_REFINEMENT_DISABLED'
    | 'OPENAI_CONFIGURATION_MISSING';
  requestId: string;
}): Promise<RefineProgrammeResult> => {
  if (input.mode === 'deterministic') {
    return {
      programme: input.baseline,
      validation: input.baselineValidation,
      source: 'deterministic',
      refinement: {
        requested: false,
        applied: false,
        status: 'not_requested',
        reason_code: null,
        model: null,
        prompt_version: null,
        schema_version: null,
      },
    };
  }

  if (!input.provider) {
    if (input.mode === 'llm_required') {
      throw refinementError(
        'LLM_REQUIRED_REFINEMENT_FAILED',
        'Required programme refinement is unavailable.',
        {
          reason_code:
            input.unavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
        },
      );
    }

    return {
      programme: input.baseline,
      validation: input.baselineValidation,
      source: 'deterministic',
      refinement: fallbackMetadata(
        input.configuredModel,
        input.unavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
      ),
    };
  }

  let context;

  try {
    context = buildRefinementContext(
      input.profile,
      input.baseline,
      input.baselineValidation,
      input.exercises,
    );
  } catch (error) {
    const reason = errorCode(error);

    if (input.mode === 'llm_required') {
      throw refinementError(
        'LLM_REQUIRED_REFINEMENT_FAILED',
        'Required programme refinement failed.',
        { reason_code: reason },
      );
    }

    return {
      programme: input.baseline,
      validation: input.baselineValidation,
      source: 'deterministic',
      refinement: fallbackMetadata(input.configuredModel, reason),
    };
  }
  let retryFeedback:
    | {
        rejectedOperationIds: string[];
        validationCodes: string[];
        messages: string[];
      }
    | undefined;
  let lastReason = 'REFINEMENT_APPLICATION_FAILED';
  let lastProviderMetadata: Partial<RefinementMetadata> = {};

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const providerResult = await input.provider.proposeRefinement(context, {
        requestId: input.requestId,
        ...(retryFeedback ? { retryFeedback } : {}),
      });
      const proposal = providerResult.proposal;
      lastProviderMetadata = {
        provider_response_id: providerResult.responseId,
        input_token_count: providerResult.usage.inputTokens,
        output_token_count: providerResult.usage.outputTokens,
        rejected_operation_count: proposal.operations.length,
      };

      if (proposal.decision === 'no_change') {
        return {
          programme: input.baseline,
          validation: input.baselineValidation,
          source: 'deterministic',
          refinement: {
            requested: true,
            applied: false,
            status: 'accepted',
            reason_code: null,
            model: providerResult.model,
            prompt_version: REFINEMENT_PROMPT_VERSION,
            schema_version: REFINEMENT_SCHEMA_VERSION,
            provider_response_id: providerResult.responseId,
            input_token_count: providerResult.usage.inputTokens,
            output_token_count: providerResult.usage.outputTokens,
            accepted_operation_count: 0,
            rejected_operation_count: 0,
          },
        };
      }

      const refined = applyProgrammeRefinement(
        input.baseline,
        proposal,
        input.exercises,
        input.profile,
      );
      const refinedValidation = validateProgramme(
        refined,
        input.profile,
        input.exercises,
      );
      const comparison = compareProgrammeValidation(
        input.baselineValidation,
        refinedValidation,
      );

      if (!comparison.accepted) {
        lastReason = comparison.reasonCode ?? 'REFINEMENT_VALIDATION_REJECTED';
        retryFeedback = {
          rejectedOperationIds: proposal.operations.map(
            (operation) => operation.operation_id,
          ),
          validationCodes: refinedValidation.findings.map(
            (finding) => finding.code,
          ),
          messages: refinedValidation.findings
            .slice(0, 8)
            .map((finding) => finding.message),
        };

        if (attempt === 0) continue;
        throw refinementError(lastReason, 'Refined programme was rejected.');
      }

      return {
        programme: refined,
        validation: refinedValidation,
        source: 'llm_refined',
        refinement: {
          requested: true,
          applied: true,
          status: 'accepted',
          reason_code: null,
          model: providerResult.model,
          prompt_version: REFINEMENT_PROMPT_VERSION,
          schema_version: REFINEMENT_SCHEMA_VERSION,
          provider_response_id: providerResult.responseId,
          input_token_count: providerResult.usage.inputTokens,
          output_token_count: providerResult.usage.outputTokens,
          accepted_operation_count: proposal.operations.length,
          rejected_operation_count: 0,
        },
      };
    } catch (error) {
      lastReason = errorCode(error);

      if (attempt === 0 && isCorrectable(lastReason)) {
        retryFeedback = {
          rejectedOperationIds: [],
          validationCodes: [lastReason],
          messages: [
            error instanceof Error
              ? error.message
              : 'Refinement proposal was rejected.',
          ],
        };
        continue;
      }

      if (input.mode === 'llm_required') {
        throw refinementError(
          'LLM_REQUIRED_REFINEMENT_FAILED',
          'Required programme refinement failed.',
          { reason_code: lastReason },
        );
      }

      return {
        programme: input.baseline,
        validation: input.baselineValidation,
        source: 'deterministic',
        refinement: fallbackMetadata(
          input.configuredModel,
          lastReason,
          lastProviderMetadata,
        ),
      };
    }
  }

  throw refinementError(
    'LLM_REQUIRED_REFINEMENT_FAILED',
    'Required programme refinement failed.',
  );
};
