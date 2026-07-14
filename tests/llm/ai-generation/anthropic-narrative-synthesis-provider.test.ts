import { describe, expect, it, vi } from 'vitest';

const { createMock } = vi.hoisted(() => ({ createMock: vi.fn() }));

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: createMock },
  })),
}));

import Anthropic from '@anthropic-ai/sdk';
import { AnthropicAiProgrammeGenerationProvider } from '../../../src/llm/ai-generation/anthropic-ai-programme-generation-provider.js';

// Regression test for a bug where the provider validated narrative output
// against the full refine()-bearing schema internally: any single sentence
// failing the goal/profile-fact contract caused the whole structured-output
// parse to be discarded and a generic "no structured output" error thrown,
// losing the per-sentence detail the retry loop needs. The provider should
// only enforce JSON *shape* here — the contract itself is re-checked by
// narrative-synthesis.service.ts against the full schema.
describe('AnthropicAiProgrammeGenerationProvider.generateNarrativeSynthesis', () => {
  it('returns output (does not throw) when one sentence fails the goal/profile-fact contract', async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            overall: {
              text: 'Because your goal is fat loss and you weigh 82kg, this uses a full-body split.',
              references_goal: true,
              references_profile_fact: true,
              source_fields: ['goal', 'current_weight_kg'],
            },
            phases: [
              {
                phase_id: 'phase-1',
                narrative: {
                  text: 'Progressive overload builds strength over time.',
                  references_goal: false,
                  references_profile_fact: false,
                  source_fields: [],
                },
              },
            ],
            day_patterns: [],
            conditioning_finishers: [],
          }),
        },
      ],
      id: 'resp-1',
      usage: { input_tokens: 100, output_tokens: 200 },
    });

    const provider = new AnthropicAiProgrammeGenerationProvider(
      new Anthropic({ apiKey: 'test-key' }),
      { anthropicModel: 'claude-sonnet-4-6' },
    );

    const result = await provider.generateNarrativeSynthesis({
      systemPrompt: 'system',
      userContent: { athlete_profile: {} },
    });

    expect(result.output).toMatchObject({
      overall: { references_goal: true },
      phases: [{ narrative: { references_goal: false } }],
    });
  });
});
