import type { z } from 'zod';
import type {
  AiStrategyOutputSchema,
  AiPhaseOutputSchema,
} from './ai-generation.schema.js';

export const AI_GENERATION_PROMPT_VERSION = 'odin_ai_gen_v1';

export type AiStrategyOutput = z.infer<typeof AiStrategyOutputSchema>;
export type AiPhaseOutput = z.infer<typeof AiPhaseOutputSchema>;

export type AiGenerationProviderContext = {
  requestId: string;
  retryFeedback?: {
    validationCodes: string[];
    messages: string[];
  };
};

export type AiGenerationResult<T> = {
  output: T;
  provider: 'openai';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};

export type AiStrategyGenerationResult = AiGenerationResult<AiStrategyOutput>;
export type AiPhaseGenerationResult = AiGenerationResult<AiPhaseOutput>;

export type PhaseSummary = {
  phase_id: string;
  phase_type: string;
  objective: string;
  exercises_used: string[];
  volume_per_muscle_group: Record<string, number>;
  progression_model: string;
};
