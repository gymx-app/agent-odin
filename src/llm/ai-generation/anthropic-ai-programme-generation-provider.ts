import Anthropic from '@anthropic-ai/sdk';
import type { ZodType } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { AppConfig } from '../../infrastructure/config/env.schema.js';
import { refinementError } from '../refinement-errors.js';
import {
  AiStrategyOutputSchema,
  AiPhaseOutputSchema,
} from './ai-generation.schema.js';
import type {
  AiStrategyGenerationResult,
  AiPhaseGenerationResult,
  AiGenerationProviderContext,
} from './ai-generation.types.js';
import type {
  AiProgrammeGenerationProvider,
  AiStrategyContext,
  AiPhaseContext,
} from './ai-programme-generation-provider.js';
import { aiStrategySystemPrompt } from './ai-generation-strategy-prompt.js';
import { aiPhaseSystemPrompt } from './ai-generation-phase-prompt.js';
import {
  aiReasoningPrompt,
  type AiReasoningResult,
} from './agent-reasoning.js';
import { AGENT_TOOLS } from './agent-tools.js';

const MAX_TOOL_TURNS = 10;

const strategyJsonSchema = zodToJsonSchema(AiStrategyOutputSchema, {
  target: 'jsonSchema7',
  $refStrategy: 'none',
});

const phaseJsonSchema = zodToJsonSchema(AiPhaseOutputSchema, {
  target: 'jsonSchema7',
  $refStrategy: 'none',
});

const anthropicTools: Anthropic.Messages.Tool[] = AGENT_TOOLS.map((tool) => ({
  name: tool.name,
  description: tool.description,
  input_schema: {
    type: 'object' as const,
    ...(tool.parameters as Record<string, unknown>),
  },
}));

export class AnthropicAiProgrammeGenerationProvider
  implements AiProgrammeGenerationProvider
{
  constructor(
    private readonly client: Anthropic,
    private readonly config: Pick<AppConfig, 'anthropicModel'>,
  ) {}

  private get model(): string {
    if (!this.config.anthropicModel) {
      throw refinementError(
        'ANTHROPIC_CONFIGURATION_MISSING',
        'Anthropic model configuration is missing.',
      );
    }
    return this.config.anthropicModel;
  }

  async generateStrategy(
    context: AiStrategyContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiStrategyGenerationResult> {
    return this.generateStructured(
      aiStrategySystemPrompt,
      {
        strategy_context: context,
        retry_feedback: providerCtx.retryFeedback ?? null,
      },
      AiStrategyOutputSchema,
      strategyJsonSchema,
      8000,
    );
  }

  async generatePhase(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiPhaseGenerationResult> {
    const model = this.model;
    const userContent = {
      phase_context: context,
      retry_feedback: providerCtx.retryFeedback ?? null,
    };

    const messages: Anthropic.Messages.MessageParam[] = [
      { role: 'user', content: JSON.stringify(userContent) },
    ];

    if (providerCtx.reasoningOutput) {
      messages.push({
        role: 'assistant',
        content: providerCtx.reasoningOutput,
      });
      messages.push({
        role: 'user',
        content:
          'Now generate the phase using the tools to find exercises and check compliance. Output the complete structured phase as JSON.',
      });
    }

    let totalInputTokens = 0;
    let totalOutputTokens = 0;

    try {
      for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
        const response = await this.client.messages.create({
          model,
          system: aiPhaseSystemPrompt,
          messages,
          tools: anthropicTools,
          max_tokens: 32000,
        });

        totalInputTokens += response.usage?.input_tokens ?? 0;
        totalOutputTokens += response.usage?.output_tokens ?? 0;

        const toolCalls: Array<{
          id: string;
          name: string;
          input: Record<string, unknown>;
        }> = [];
        let textOutput = '';

        for (const block of response.content) {
          if (block.type === 'tool_use') {
            toolCalls.push({
              id: block.id,
              name: block.name,
              input: block.input as Record<string, unknown>,
            });
          }
          if (block.type === 'text') {
            textOutput += block.text;
          }
        }

        if (
          response.stop_reason === 'end_turn' &&
          textOutput &&
          toolCalls.length === 0
        ) {
          const parsed = this.parseJsonOutput(textOutput, AiPhaseOutputSchema);
          if (parsed) {
            return {
              output: parsed,
              provider: 'anthropic',
              model,
              responseId: response.id ?? null,
              usage: {
                inputTokens: totalInputTokens,
                outputTokens: totalOutputTokens,
              },
            };
          }
        }

        if (toolCalls.length > 0 && providerCtx.toolExecutor) {
          messages.push({ role: 'assistant', content: response.content });

          const toolResults: Anthropic.Messages.ToolResultBlockParam[] =
            toolCalls.map((call) => {
              const result = providerCtx.toolExecutor!(call.name, call.input);
              return {
                type: 'tool_result' as const,
                tool_use_id: call.id,
                content: JSON.stringify(result),
              };
            });

          messages.push({ role: 'user', content: toolResults });
          continue;
        }

        if (toolCalls.length > 0 && !providerCtx.toolExecutor) {
          throw refinementError(
            'LLM_OUTPUT_INVALID',
            'Model requested tool calls but no tool executor is available.',
          );
        }

        throw refinementError(
          'LLM_OUTPUT_INVALID',
          'The generation provider returned no structured output or tool calls.',
        );
      }

      throw refinementError(
        'LLM_OUTPUT_INVALID',
        `Phase generation exceeded maximum ${MAX_TOOL_TURNS} tool-calling turns.`,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('LLM_')
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        (error.name.includes('Timeout') || error.message.includes('timed out'))
      ) {
        throw refinementError(
          'LLM_PROVIDER_TIMEOUT',
          'The generation provider timed out.',
        );
      }

      const detail = error instanceof Error ? error.message : String(error);
      throw refinementError(
        'LLM_PROVIDER_ERROR',
        `The generation provider is unavailable: ${detail}`,
      );
    }
  }

  async generateReasoning(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiReasoningResult> {
    const model = this.model;
    const userContent = {
      phase_context: context,
      retry_feedback: providerCtx.retryFeedback ?? null,
    };

    try {
      const response = await this.client.messages.create({
        model,
        system: aiReasoningPrompt,
        messages: [
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        max_tokens: 1500,
      });

      let reasoning = '';
      for (const block of response.content) {
        if (block.type === 'text') {
          reasoning += block.text;
        }
      }

      return {
        reasoning,
        usage: {
          inputTokens: response.usage?.input_tokens ?? null,
          outputTokens: response.usage?.output_tokens ?? null,
        },
      };
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name.includes('Timeout') || error.message.includes('timed out'))
      ) {
        throw refinementError(
          'LLM_PROVIDER_TIMEOUT',
          'The reasoning call timed out.',
        );
      }

      const detail = error instanceof Error ? error.message : String(error);
      throw refinementError(
        'LLM_PROVIDER_ERROR',
        `The generation provider is unavailable: ${detail}`,
      );
    }
  }

  private async generateStructured<T>(
    systemPrompt: string,
    userContent: unknown,
    schema: ZodType<T>,
    jsonSchema: Record<string, unknown>,
    maxOutputTokens: number,
  ): Promise<AnthropicGenerationResult<T>> {
    const model = this.model;
    const structuredPrompt =
      `${systemPrompt}\n\n# OUTPUT FORMAT\nRespond with a single JSON object matching this schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\nRespond ONLY with valid JSON. No markdown fences, no explanations.`;

    try {
      const response = await this.client.messages.create({
        model,
        system: structuredPrompt,
        messages: [
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        max_tokens: maxOutputTokens,
      });

      for (const block of response.content) {
        if (block.type === 'text') {
          const parsed = this.parseJsonOutput(block.text, schema);
          if (parsed) {
            return {
              output: parsed,
              provider: 'anthropic',
              model,
              responseId: response.id ?? null,
              usage: {
                inputTokens: response.usage?.input_tokens ?? null,
                outputTokens: response.usage?.output_tokens ?? null,
              },
            };
          }
        }
      }

      throw refinementError(
        'LLM_OUTPUT_INVALID',
        'The generation provider returned no structured output.',
      );
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        typeof error.code === 'string' &&
        error.code.startsWith('LLM_')
      ) {
        throw error;
      }

      if (
        error instanceof Error &&
        (error.name.includes('Timeout') || error.message.includes('timed out'))
      ) {
        throw refinementError(
          'LLM_PROVIDER_TIMEOUT',
          'The generation provider timed out.',
        );
      }

      const detail = error instanceof Error ? error.message : String(error);
      throw refinementError(
        'LLM_PROVIDER_ERROR',
        `The generation provider is unavailable: ${detail}`,
      );
    }
  }

  private parseJsonOutput<T>(text: string, schema: ZodType<T>): T | null {
    let jsonText = text.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    try {
      const raw = JSON.parse(jsonText);
      const parsed = schema.safeParse(raw);
      if (parsed.success) {
        return parsed.data;
      }
    } catch {
      // not valid JSON
    }

    return null;
  }
}

type AnthropicGenerationResult<T> = {
  output: T;
  provider: 'anthropic';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};
