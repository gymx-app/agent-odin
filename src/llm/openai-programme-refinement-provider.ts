import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { AppConfig } from '../infrastructure/config/env.schema.js';
import type {
  ProgrammeRefinementProvider,
  ProgrammeRefinementProviderContext,
} from './programme-refinement-provider.js';
import type { RefinementContext } from './refinement-context-builder.js';
import { refinementError } from './refinement-errors.js';
import { refinementSystemPrompt } from './refinement-prompt.js';
import { ProgrammeRefinementProposalSchema } from './refinement.schema.js';
import type { ProgrammeRefinementResult } from './refinement.types.js';

export class OpenAIProgrammeRefinementProvider implements ProgrammeRefinementProvider {
  constructor(
    private readonly client: OpenAI,
    private readonly config: Pick<AppConfig, 'openaiModel'>,
  ) {}

  async proposeRefinement(
    input: RefinementContext,
    context: ProgrammeRefinementProviderContext,
  ): Promise<ProgrammeRefinementResult> {
    if (!this.config.openaiModel) {
      throw refinementError(
        'OPENAI_CONFIGURATION_MISSING',
        'OpenAI model configuration is missing.',
      );
    }

    try {
      const response = await this.client.responses.parse({
        model: this.config.openaiModel,
        input: [
          { role: 'system', content: refinementSystemPrompt },
          {
            role: 'user',
            content: JSON.stringify({
              refinement_context: input,
              retry_feedback: context.retryFeedback ?? null,
            }),
          },
        ],
        text: {
          format: zodTextFormat(
            ProgrammeRefinementProposalSchema,
            'programme_refinement',
          ),
        },
        max_output_tokens: 4000,
      });

      for (const output of response.output) {
        if (output.type !== 'message') continue;

        for (const item of output.content) {
          if (item.type === 'refusal') {
            throw refinementError(
              'LLM_PROVIDER_REFUSAL',
              'The refinement provider declined the request.',
            );
          }

          if (item.type === 'output_text' && item.parsed) {
            const parsed = ProgrammeRefinementProposalSchema.safeParse(
              item.parsed,
            );

            if (!parsed.success) {
              throw refinementError(
                'LLM_OUTPUT_INVALID',
                'The refinement provider returned invalid structured output.',
              );
            }

            return {
              proposal: parsed.data,
              provider: 'openai',
              model: this.config.openaiModel,
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
        'The refinement provider returned no structured proposal.',
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
          'The refinement provider timed out.',
        );
      }

      throw refinementError(
        'LLM_PROVIDER_ERROR',
        'The refinement provider is unavailable.',
      );
    }
  }
}
