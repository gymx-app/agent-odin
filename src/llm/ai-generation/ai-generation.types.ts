import type { z } from 'zod';
import type {
  AiStrategyOutputSchema,
  AiPhaseOutputSchema,
  AiWeekOutputSchema,
} from './ai-generation.schema.js';
import type { ToolExecutor } from './agent-tool-executor.js';

export const AI_GENERATION_PROMPT_VERSION = 'odin_ai_gen_v1';

export type AiStrategyOutput = z.infer<typeof AiStrategyOutputSchema>;
export type AiPhaseOutput = z.infer<typeof AiPhaseOutputSchema>;
export type AiWeekOutput = z.infer<typeof AiWeekOutputSchema>;

export type AiGenerationProviderContext = {
  requestId: string;
  retryFeedback?: {
    validationCodes: string[];
    messages: string[];
  };
  toolExecutor?: ToolExecutor;
  reasoningOutput?: string;
  toolConversation?: unknown[];
  toolsOnly?: boolean;
};

export type AiGenerationResult<T> = {
  output: T;
  provider: 'openai' | 'anthropic';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};

export type AiStrategyGenerationResult = AiGenerationResult<AiStrategyOutput>;
export type AiPhaseGenerationResult = AiGenerationResult<AiPhaseOutput>;
export type AiWeekGenerationResult = AiGenerationResult<AiWeekOutput>;

export type AiWeekGenerationContext = {
  phaseContext: Record<string, unknown>;
  weekPrompt: string;
  reasoning?: string;
  toolConversation?: unknown[];
};

export type PhaseSummary = {
  phase_id: string;
  phase_type: string;
  objective: string;
  exercises_used: string[];
  volume_per_muscle_group: Record<string, number>;
  progression_model: string;
};
