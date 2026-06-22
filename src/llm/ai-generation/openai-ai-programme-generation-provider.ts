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
    return this.generate(
      aiStrategySystemPrompt,
      { strategy_context: context, retry_feedback: providerCtx.retryFeedback ?? null },
      AiStrategyOutputSchema,
      'ai_strategy_generation',
      8000,
    );
  }

  async generatePhase(
    context: AiPhaseContext,
    providerCtx: AiGenerationProviderContext,
  ): Promise<AiPhaseGenerationResult> {
    return this.generate(
      aiPhaseSystemPrompt,
      { phase_context: context, retry_feedback: providerCtx.retryFeedback ?? null },
      AiPhaseOutputSchema,
      'ai_phase_generation',
      32000,
    );
  }

  private async generate<T>(
    systemPrompt: string,
    userContent: unknown,
    schema: import('zod').ZodType<T>,
    schemaName: string,
    maxOutputTokens: number,
  ): Promise<AiGenerationResult<T>> {
    const model = this.model;

    try {
      const response = await this.client.responses.parse({
        model,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(userContent) },
        ],
        text: {
          format: zodTextFormat(schema as never, schemaName),
        },
        max_output_tokens: maxOutputTokens,
      });

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
            const parsed = schema.safeParse(item.parsed);

            if (!parsed.success) {
              throw refinementError(
                'LLM_OUTPUT_INVALID',
                'The generation provider returned invalid structured output.',
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

      throw refinementError(
        'LLM_PROVIDER_ERROR',
        'The generation provider is unavailable.',
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
