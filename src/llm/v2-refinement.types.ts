import type { z } from 'zod';
import type {
  V2RefinementOperationSchema,
  V2RefinementProposalSchema,
  V2RefinementMetadataSchema,
} from './v2-refinement.schema.js';

export const V2_REFINEMENT_PROMPT_VERSION = 'odin_refinement_v2';
export const V2_REFINEMENT_SCHEMA_VERSION = 2;

export type V2RefinementOperation = z.infer<typeof V2RefinementOperationSchema>;
export type V2RefinementProposal = z.infer<typeof V2RefinementProposalSchema>;
export type V2RefinementMetadata = z.infer<typeof V2RefinementMetadataSchema>;

export type V2RefinementResult = {
  proposal: V2RefinementProposal;
  provider: 'openai';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};
