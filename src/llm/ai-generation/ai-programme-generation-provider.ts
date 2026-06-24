import type {
  AiGenerationProviderContext,
  AiPhaseGenerationResult,
  AiStrategyGenerationResult,
  AiWeekGenerationResult,
  AiWeekGenerationContext,
} from './ai-generation.types.js';
import type { AiReasoningResult } from './agent-reasoning.js';

export type AiStrategyContext = {
  athlete: Record<string, unknown>;
  evidence_rules: Record<string, unknown>;
  exercise_library_summary: Record<string, unknown>;
  constraints: Record<string, unknown>;
};

export type AiPhaseContext = {
  athlete: Record<string, unknown>;
  strategy: Record<string, unknown>;
  calendar: Record<string, unknown>;
  phase_skeleton: {
    phase_number: number;
    phase_type: string;
    objective: string;
    start_week: number;
    end_week: number;
    weeks_count: number;
    volume_direction: string;
    intensity_direction: string;
    effort_direction: string;
    progression_model: string;
  };
  tool_instructions: string;
  prior_phase_summaries: Record<string, unknown>[];
  policies: Record<string, unknown>;
  constraints: Record<string, unknown>;
};

export interface AiProgrammeGenerationProvider {
  generateStrategy(
    context: AiStrategyContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiStrategyGenerationResult>;

  generatePhase(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiPhaseGenerationResult>;

  generateReasoning?(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiReasoningResult>;

  generateWeek?(
    weekCtx: AiWeekGenerationContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiWeekGenerationResult>;
}
