import type OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import type { AppConfig } from '../infrastructure/config/env.schema.js';
import type {
  V2ProgrammeRefinementProvider,
  V2ProgrammeRefinementProviderContext,
} from './v2-programme-refinement-provider.js';
import type { V2RefinementContext } from './v2-refinement-context-builder.js';
import { refinementError } from './refinement-errors.js';
import { v2RefinementSystemPrompt } from './v2-refinement-prompt.js';
import { V2RefinementProposalSchema } from './v2-refinement.schema.js';
import type { V2RefinementResult } from './v2-refinement.types.js';

export class OpenAIV2ProgrammeRefinementProvider
  implements V2ProgrammeRefinementProvider
{
  constructor(
    private readonly client: OpenAI,
    private readonly config: Pick<AppConfig, 'openaiModel'>,
  ) {}

  async proposeV2Refinement(
    input: V2RefinementContext,
    context: V2ProgrammeRefinementProviderContext,
  ): Promise<V2RefinementResult> {
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
          { role: 'system', content: v2RefinementSystemPrompt },
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
            V2RefinementProposalSchema,
            'v2_programme_refinement',
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
            const parsed = V2RefinementProposalSchema.safeParse(item.parsed);

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
