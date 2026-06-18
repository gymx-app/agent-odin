import type { ProgrammeRefinementResult } from './refinement.types.js';
import type { RefinementContext } from './refinement-context-builder.js';

export type ProgrammeRefinementProviderContext = {
  requestId: string;
  retryFeedback?: {
    rejectedOperationIds: string[];
    validationCodes: string[];
    messages: string[];
  };
};

export interface ProgrammeRefinementProvider {
  proposeRefinement(
    input: RefinementContext,
    context: ProgrammeRefinementProviderContext,
  ): Promise<ProgrammeRefinementResult>;
}
