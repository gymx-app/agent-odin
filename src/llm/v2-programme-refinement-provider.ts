import type { V2RefinementResult } from './v2-refinement.types.js';
import type { V2RefinementContext } from './v2-refinement-context-builder.js';

export type V2ProgrammeRefinementProviderContext = {
  requestId: string;
  retryFeedback?: {
    rejectedOperationIds: string[];
    validationCodes: string[];
    messages: string[];
  };
};

export interface V2ProgrammeRefinementProvider {
  proposeV2Refinement(
    input: V2RefinementContext,
    context: V2ProgrammeRefinementProviderContext,
  ): Promise<V2RefinementResult>;
}
