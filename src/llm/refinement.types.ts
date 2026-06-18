import type { z } from 'zod';
import type {
  ProgrammeRefinementProposalSchema,
  RefinementMetadataSchema,
} from './refinement.schema.js';

export const REFINEMENT_PROMPT_VERSION = 'odin_refinement_v1';
export const REFINEMENT_SCHEMA_VERSION = 1;

export type ProgrammeRefinementProposal = z.infer<
  typeof ProgrammeRefinementProposalSchema
>;

export type RefinementMode = 'deterministic' | 'llm_optional' | 'llm_required';

export type RefinementMetadata = z.infer<typeof RefinementMetadataSchema>;

export type ProgrammeRefinementResult = {
  proposal: ProgrammeRefinementProposal;
  provider: 'openai';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};
