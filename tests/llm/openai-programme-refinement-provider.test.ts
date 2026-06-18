import { describe, expect, it, vi } from 'vitest';
import type OpenAI from 'openai';
import { OpenAIProgrammeRefinementProvider } from '../../src/llm/openai-programme-refinement-provider.js';
import { buildRefinementContext } from '../../src/llm/refinement-context-builder.js';
import { proposal, refinementFixture } from './test-refinement.js';

const context = () => {
  const fixture = refinementFixture();

  return buildRefinementContext(
    fixture.profile,
    fixture.programme,
    fixture.validation,
    fixture.exercises,
  );
};

const client = (parse: ReturnType<typeof vi.fn>): OpenAI =>
  ({
    responses: { parse },
  }) as unknown as OpenAI;

describe('OpenAIProgrammeRefinementProvider', () => {
  it('uses the configured model and captures safe response metadata', async () => {
    const parsed = proposal([]);
    const parse = vi.fn(async () => ({
      id: 'resp-1',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', parsed }],
        },
      ],
      usage: { input_tokens: 120, output_tokens: 30 },
    }));
    const provider = new OpenAIProgrammeRefinementProvider(client(parse), {
      openaiModel: 'configured-model',
    });

    await expect(
      provider.proposeRefinement(context(), { requestId: 'req-1' }),
    ).resolves.toMatchObject({
      proposal: parsed,
      model: 'configured-model',
      responseId: 'resp-1',
      usage: { inputTokens: 120, outputTokens: 30 },
    });
    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'configured-model',
        max_output_tokens: 4000,
      }),
    );
  });

  it('sanitizes refusals, timeouts and provider errors', async () => {
    const refusalProvider = new OpenAIProgrammeRefinementProvider(
      client(
        vi.fn(async () => ({
          output: [
            {
              type: 'message',
              content: [{ type: 'refusal', refusal: 'raw refusal' }],
            },
          ],
        })),
      ),
      { openaiModel: 'configured-model' },
    );

    await expect(
      refusalProvider.proposeRefinement(context(), { requestId: 'req-1' }),
    ).rejects.toMatchObject({ code: 'LLM_PROVIDER_REFUSAL' });

    const timeoutProvider = new OpenAIProgrammeRefinementProvider(
      client(
        vi.fn(async () => {
          throw new Error('request timed out with secret internals');
        }),
      ),
      { openaiModel: 'configured-model' },
    );

    await expect(
      timeoutProvider.proposeRefinement(context(), { requestId: 'req-1' }),
    ).rejects.toMatchObject({
      code: 'LLM_PROVIDER_TIMEOUT',
      message: 'The refinement provider timed out.',
    });
  });
});
