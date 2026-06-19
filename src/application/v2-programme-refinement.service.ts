import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { programmeValidationService } from '../validation/programme-validation.service.js';
import { applyV2ProgrammeRefinement } from '../llm/v2-refinement-applier.js';
import { buildV2RefinementContext } from '../llm/v2-refinement-context-builder.js';
import { RefinementError, refinementError } from '../llm/refinement-errors.js';
import { compareV2ProgrammeValidation } from '../llm/v2-refinement-policy.js';
import type { V2ProgrammeRefinementProvider } from '../llm/v2-programme-refinement-provider.js';
import type {
  V2RefinementMetadata,
  V2RefinementProposal,
} from '../llm/v2-refinement.types.js';
import { V2RefinementProposalSchema } from '../llm/v2-refinement.schema.js';
import type { RefinementMode } from '../llm/refinement.types.js';

export type V2RefineProgrammeResult = {
  programme: LongitudinalOdinProgramme;
  validation: ProgrammeValidationReport;
  source: 'deterministic' | 'llm_refined';
  refinement: V2RefinementMetadata;
};

const notRequestedMetadata: V2RefinementMetadata = {
  requested: false,
  attempted: false,
  applied: false,
  retry_attempted: false,
  operation_count: 0,
  accepted_operation_types: [],
  status: 'not_requested',
  reason_code: null,
};

const fallbackMetadata = (reasonCode: string): V2RefinementMetadata => ({
  requested: true,
  attempted: true,
  applied: false,
  retry_attempted: false,
  operation_count: 0,
  accepted_operation_types: [],
  status: 'fallback',
  reason_code: reasonCode,
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
    'V2_REFINEMENT_VALIDATION_REJECTED',
    'V2_REFINEMENT_SCORE_WORSE',
    'V2_REFINEMENT_ERROR_COUNT_WORSE',
    'V2_REFINEMENT_NEW_WARNING',
    'V2_REFINEMENT_HARD_CATEGORY_DEGRADED',
  ].includes(code);

export const refineV2Programme = async (input: {
  mode: RefinementMode;
  baseline: LongitudinalOdinProgramme;
  baselineValidation: ProgrammeValidationReport;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  provider?: V2ProgrammeRefinementProvider;
  configuredModel: string | null;
  unavailableReason?:
    | 'LLM_REFINEMENT_DISABLED'
    | 'OPENAI_CONFIGURATION_MISSING';
  requestId: string;
}): Promise<V2RefineProgrammeResult> => {
  if (input.mode === 'deterministic') {
    return {
      programme: input.baseline,
      validation: input.baselineValidation,
      source: 'deterministic',
      refinement: notRequestedMetadata,
    };
  }

  if (!input.provider) {
    if (input.mode === 'llm_required') {
      throw refinementError(
        'LLM_REQUIRED_REFINEMENT_FAILED',
        'Required V2 programme refinement is unavailable.',
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
        input.unavailableReason ?? 'OPENAI_CONFIGURATION_MISSING',
      ),
    };
  }

  let context;
  try {
    context = buildV2RefinementContext(
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
        'Required V2 programme refinement failed.',
        { reason_code: reason },
      );
    }
    return {
      programme: input.baseline,
      validation: input.baselineValidation,
      source: 'deterministic',
      refinement: fallbackMetadata(reason),
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
  let retryAttempted = false;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const providerResult = await input.provider.proposeV2Refinement(context, {
        requestId: input.requestId,
        ...(retryFeedback ? { retryFeedback } : {}),
      });

      const parsed = V2RefinementProposalSchema.safeParse(
        providerResult.proposal,
      );
      if (!parsed.success) {
        throw refinementError(
          'REFINEMENT_PROPOSAL_INVALID',
          'V2 proposal failed schema validation.',
        );
      }
      const proposal = parsed.data as V2RefinementProposal;

      if (proposal.decision === 'no_change') {
        return {
          programme: input.baseline,
          validation: input.baselineValidation,
          source: 'deterministic',
          refinement: {
            requested: true,
            attempted: true,
            applied: false,
            retry_attempted: retryAttempted,
            operation_count: 0,
            accepted_operation_types: [],
            status: 'applied',
            reason_code: null,
          },
        };
      }

      const refined = applyV2ProgrammeRefinement(
        input.baseline,
        proposal,
        input.exercises,
        input.profile,
      );
      const refinedValidation = programmeValidationService.validateVersioned({
        programme: refined,
        profile: input.profile,
        exercises: input.exercises,
      });
      const comparison = compareV2ProgrammeValidation(
        input.baselineValidation,
        refinedValidation,
      );

      if (!comparison.accepted) {
        lastReason =
          comparison.reasonCode ?? 'V2_REFINEMENT_VALIDATION_REJECTED';
        retryFeedback = {
          rejectedOperationIds: proposal.operations.map(
            (operation) => operation.operation_id,
          ),
          validationCodes: [lastReason],
          messages: refinedValidation.findings
            .filter(
              (finding) =>
                finding.severity === 'error' || finding.severity === 'warning',
            )
            .slice(0, 8)
            .map((finding) => finding.code),
        };

        if (attempt === 0) {
          retryAttempted = true;
          continue;
        }
        throw refinementError(lastReason, 'Refined V2 programme was rejected.');
      }

      return {
        programme: refined,
        validation: refinedValidation,
        source: 'llm_refined',
        refinement: {
          requested: true,
          attempted: true,
          applied: true,
          retry_attempted: retryAttempted,
          operation_count: proposal.operations.length,
          accepted_operation_types: [
            ...new Set(
              proposal.operations.map((operation) => operation.operation_type),
            ),
          ],
          status: 'applied',
          reason_code: null,
        },
      };
    } catch (error) {
      lastReason = errorCode(error);

      if (attempt === 0 && isCorrectable(lastReason)) {
        retryAttempted = true;
        retryFeedback = {
          rejectedOperationIds: [],
          validationCodes: [lastReason],
          messages: [
            error instanceof Error
              ? error.message
              : 'V2 refinement proposal was rejected.',
          ],
        };
        continue;
      }

      if (input.mode === 'llm_required') {
        throw refinementError(
          'LLM_REQUIRED_REFINEMENT_FAILED',
          'Required V2 programme refinement failed.',
          { reason_code: lastReason },
        );
      }

      return {
        programme: input.baseline,
        validation: input.baselineValidation,
        source: 'deterministic',
        refinement: {
          ...fallbackMetadata(lastReason),
          retry_attempted: retryAttempted,
        },
      };
    }
  }

  if (input.mode === 'llm_required') {
    throw refinementError(
      'LLM_REQUIRED_REFINEMENT_FAILED',
      'Required V2 programme refinement failed after retry.',
      { reason_code: lastReason },
    );
  }

  return {
    programme: input.baseline,
    validation: input.baselineValidation,
    source: 'deterministic',
    refinement: {
      ...fallbackMetadata(lastReason),
      retry_attempted: true,
    },
  };
};
