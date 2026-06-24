import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
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
import { aiReasoningPrompt, type AiReasoningResult } from './agent-reasoning.js';
import type { FunctionTool } from 'openai/resources/responses/responses';
import { AGENT_TOOLS } from './agent-tools.js';
import { toOpenAISchema } from './openai-schema-compat.js';

const MAX_TOOL_TURNS = 10;
const MAX_RATE_LIMIT_RETRIES = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const isRateLimitError = (error: unknown): number | null => {
  if (!(error instanceof Error)) return null;
  const msg = error.message ?? '';
  if ('status' in error && (error as { status: number }).status === 429) {
    const match = msg.match(/try again in ([\d.]+)s/i);
    return match?.[1] ? Math.ceil(parseFloat(match[1]) * 1000) : 10_000;
  }
  return null;
};

const withRateLimitRetry = async <T>(fn: () => Promise<T>): Promise<T> => {
  for (let attempt = 0; attempt < MAX_RATE_LIMIT_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const waitMs = isRateLimitError(error);
      if (waitMs === null || attempt === MAX_RATE_LIMIT_RETRIES - 1) throw error;
      await sleep(waitMs + 1000);
    }
  }
  throw new Error('unreachable');
};

const OpenAIStrategySchema = toOpenAISchema(AiStrategyOutputSchema);
const OpenAIPhaseSchema = toOpenAISchema(AiPhaseOutputSchema);

export class OpenAIAiProgrammeGenerationProvider
  implements AiProgrammeGenerationProvider
{
  constructor(
    private readonly client: OpenAI,
    private readonly config: Pick<
      AppConfig,
      'openaiGenerationModel' | 'openaiGenerationTimeoutMs'
    >,
  ) {}

  private get model(): string {
    if (!this.config.openaiGenerationModel) {
      throw refinementError(
        'OPENAI_CONFIGURATION_MISSING',
        'OpenAI generation model configuration is missing.',
      );
    }
    return this.config.openaiGenerationModel;
  }

  async generateStrategy(
    context: AiStrategyContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiStrategyGenerationResult> {
    return this.generateStructured(
      aiStrategySystemPrompt,
      { strategy_context: context, retry_feedback: providerCtx.retryFeedback ?? null },
      AiStrategyOutputSchema,
      'ai_strategy_generation',
      8000,
      OpenAIStrategySchema,
    );
  }

  async generatePhase(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiPhaseGenerationResult> {
    const model = this.model;
    const userContent = { phase_context: context, retry_feedback: providerCtx.retryFeedback ?? null };

    const input: OpenAI.Responses.ResponseInputItem[] = [
      { role: 'system', content: aiPhaseSystemPrompt },
      { role: 'user', content: JSON.stringify(userContent) },
    ];

    if (providerCtx.reasoningOutput) {
      input.push({ role: 'assistant', content: providerCtx.reasoningOutput });
      input.push({
        role: 'user',
        content: 'Now generate the phase using the tools to find exercises and check compliance. Output the complete structured phase.',
      });
    }

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let previousResponseId: string | undefined;

    try {
      for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
        const response = await withRateLimitRetry(() => this.client.responses.parse({
          model,
          input,
          ...(previousResponseId
            ? { previous_response_id: previousResponseId }
            : {}),
          tools: AGENT_TOOLS as FunctionTool[],
          text: {
            format: zodTextFormat(OpenAIPhaseSchema as never, 'ai_phase_generation'),
          },
          max_output_tokens: 32000,
        }));

        previousResponseId = response.id;
        totalInputTokens += response.usage?.input_tokens ?? 0;
        totalOutputTokens += response.usage?.output_tokens ?? 0;

        const toolCalls: Array<{ id: string; name: string; arguments: string }> = [];
        let parsedOutput: AiPhaseGenerationResult['output'] | null = null;

        for (const output of response.output) {
          if (output.type === 'function_call') {
            toolCalls.push({
              id: output.call_id,
              name: output.name,
              arguments: output.arguments,
            });
          }

          if (output.type === 'message') {
            for (const item of output.content) {
              if (item.type === 'refusal') {
                throw refinementError(
                  'LLM_PROVIDER_REFUSAL',
                  'The generation provider declined the request.',
                );
              }
              if (item.type === 'output_text' && item.parsed) {
                const parsed = AiPhaseOutputSchema.safeParse(item.parsed);
                if (parsed.success) {
                  parsedOutput = parsed.data;
                } else {
                  throw refinementError(
                    'LLM_OUTPUT_INVALID',
                    `Phase output failed validation: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
                  );
                }
              }
            }
          }
        }

        if (parsedOutput) {
          return {
            output: parsedOutput,
            provider: 'openai',
            model,
            responseId: previousResponseId ?? null,
            usage: {
              inputTokens: totalInputTokens,
              outputTokens: totalOutputTokens,
            },
          };
        }

        if (toolCalls.length > 0 && providerCtx.toolExecutor) {
          const toolResults: OpenAI.Responses.ResponseInputItem[] = [];
          for (const call of toolCalls) {
            let args: Record<string, unknown>;
            try {
              args = JSON.parse(call.arguments) as Record<string, unknown>;
            } catch {
              args = {};
            }
            const result = providerCtx.toolExecutor(call.name, args);
            toolResults.push({
              type: 'function_call_output',
              call_id: call.id,
              output: JSON.stringify(result),
            });
          }
          input.length = 0;
          input.push(...toolResults);
          continue;
        }

        if (toolCalls.length > 0 && !providerCtx.toolExecutor) {
          throw refinementError(
            'LLM_OUTPUT_INVALID',
            'Model requested tool calls but no tool executor is available.',
          );
        }

        const outputTypes = response.output.map((o) => o.type).join(', ');
        throw refinementError(
          'LLM_OUTPUT_INVALID',
          `The generation provider returned no structured output or tool calls. Response contained: [${outputTypes}]`,
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
    const userContent = { phase_context: context, retry_feedback: providerCtx.retryFeedback ?? null };

    try {
      const response = await withRateLimitRetry(() => this.client.responses.create({
        model,
        input: [
          { role: 'system', content: aiReasoningPrompt },
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        max_output_tokens: 1500,
      }));

      let reasoning = '';
      for (const output of response.output) {
        if (output.type === 'message') {
          for (const item of output.content) {
            if (item.type === 'output_text') {
              reasoning += item.text;
            }
          }
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
    schema: import('zod').ZodType<T>,
    schemaName: string,
    maxOutputTokens: number,
    openaiSchema?: import('zod').ZodTypeAny,
  ): Promise<AiGenerationResult<T>> {
    const model = this.model;

    try {
      const response = await withRateLimitRetry(() => this.client.responses.parse({
        model,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        text: {
          format: zodTextFormat((openaiSchema ?? schema) as never, schemaName),
        },
        max_output_tokens: maxOutputTokens,
      }));

      for (const output of response.output) {
        if (output.type !== 'message') continue;

        for (const item of output.content) {
          if (item.type === 'refusal') {
            throw refinementError(
              'LLM_PROVIDER_REFUSAL',
              'The generation provider declined the request.',
            );
          }

          if (item.type === 'output_text' && item.parsed) {
            const validationSchema = openaiSchema ?? schema;
            const parsed = validationSchema.safeParse(item.parsed);

            if (!parsed.success) {
              throw refinementError(
                'LLM_OUTPUT_INVALID',
                `The generation provider returned invalid structured output: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
              );
            }

            return {
              output: parsed.data,
              provider: 'openai',
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
}

type AiGenerationResult<T> = {
  output: T;
  provider: 'openai';
  model: string;
  responseId: string | null;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
};
