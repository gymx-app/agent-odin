import { describe, expect, it, vi } from 'vitest';
import { synthesizeNarratives } from '../../../src/llm/ai-generation/narrative-synthesis.service.js';
import { getProvider } from '../../../src/llm/ai-generation/step-request-helpers.js';
import type { AiProgrammeGenerationProvider } from '../../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { AppConfig } from '../../../src/infrastructure/config/env.schema.js';

const validSentence = (text: string, citationCodes?: string[]) => ({
  text,
  references_goal: true,
  references_profile_fact: true,
  source_fields: ['goal', 'current_weight_kg'],
  ...(citationCodes ? { citation_codes: citationCodes } : {}),
});

const validOutput = (citationCodes?: string[]) => ({
  overall: validSentence(
    'Because your goal is fat loss and you weigh 82kg, this programme uses a full-body split.',
    citationCodes,
  ),
  phases: [
    {
      phase_id: 'phase-1',
      narrative: validSentence(
        'This foundation phase suits your fat loss goal given your 82kg starting weight.',
        citationCodes,
      ),
    },
  ],
  day_patterns: [],
  conditioning_finishers: [],
});

const invalidOutput = () => ({
  overall: {
    text: 'Progressive overload builds strength over time.',
    references_goal: false,
    references_profile_fact: false,
    source_fields: [],
  },
  phases: [],
  day_patterns: [],
  conditioning_finishers: [],
});

const baseInput = {
  profile: { goal: 'fat_loss', current_weight_kg: 82 },
  rationale: { combined: [] },
  validation_findings: [],
  citation_codes: ['SCHOENFELD_2017_DOSE_RESPONSE'],
};

const mockUsage = { inputTokens: 100, outputTokens: 200 };

const makeMockProvider = (
  generateNarrativeSynthesis: NonNullable<
    AiProgrammeGenerationProvider['generateNarrativeSynthesis']
  >,
): AiProgrammeGenerationProvider => ({
  generateStrategy: vi.fn(),
  generatePhase: vi.fn(),
  generateNarrativeSynthesis,
});

describe('synthesizeNarratives', () => {
  it('produces narratives passing the goal-aware contract on success', async () => {
    const generateNarrativeSynthesis = vi.fn().mockResolvedValueOnce({
      output: validOutput(['SCHOENFELD_2017_DOSE_RESPONSE']),
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      usage: mockUsage,
    });
    const provider = makeMockProvider(generateNarrativeSynthesis);

    const result = await synthesizeNarratives(baseInput, provider, 'req-1');

    expect(result.narratives_unavailable).toBe(false);
    if (result.narratives_unavailable) throw new Error('expected success');
    expect(result.narratives.overall.references_goal).toBe(true);
    expect(result.narratives.overall.references_profile_fact).toBe(true);
    expect(result.narratives.phases[0]!.narrative.references_goal).toBe(true);
    expect(generateNarrativeSynthesis).toHaveBeenCalledTimes(1);
    expect(generateNarrativeSynthesis).toHaveBeenCalledWith(
      expect.objectContaining({ systemPrompt: expect.any(String) }),
      { requestId: 'req-1' },
    );
  });

  it('retries with feedback when a narrative fails the contract, then succeeds', async () => {
    const generateNarrativeSynthesis = vi
      .fn()
      .mockResolvedValueOnce({
        output: invalidOutput(),
        provider: 'anthropic',
        model: 'claude-sonnet-4-6',
        usage: mockUsage,
      })
      .mockResolvedValueOnce({
        output: validOutput(),
        provider: 'anthropic',
        model: 'claude-sonnet-4-6',
        usage: mockUsage,
      });
    const provider = makeMockProvider(generateNarrativeSynthesis);

    const result = await synthesizeNarratives(baseInput, provider, 'req-1');

    expect(generateNarrativeSynthesis).toHaveBeenCalledTimes(2);
    const secondCallArgs = generateNarrativeSynthesis.mock.calls[1]![0];
    expect(
      (secondCallArgs.userContent as { retry_feedback: unknown }).retry_feedback,
    ).not.toBeNull();
    expect(result.narratives_unavailable).toBe(false);
  });

  it('does not block the response when synthesis fails entirely', async () => {
    const generateNarrativeSynthesis = vi
      .fn()
      .mockRejectedValue(new Error('provider unavailable'));
    const provider = makeMockProvider(generateNarrativeSynthesis);

    const result = await synthesizeNarratives(baseInput, provider, 'req-1');

    expect(result.narratives).toBeNull();
    expect(result.citations).toBeNull();
    expect(result.narratives_unavailable).toBe(true);
    if (!result.narratives_unavailable) throw new Error('expected unavailable');
    expect(result.retry_reasons).toHaveLength(3);
    expect(result.retry_reasons[0]).toContain('provider unavailable');
    expect(generateNarrativeSynthesis).toHaveBeenCalledTimes(3);
  });

  it('returns unavailable without calling anything when the provider does not support narrative synthesis', async () => {
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy: vi.fn(),
      generatePhase: vi.fn(),
    };

    const result = await synthesizeNarratives(baseInput, provider, 'req-1');

    expect(result.narratives_unavailable).toBe(true);
  });

  it('deduplicates citations referenced by multiple narratives', async () => {
    const generateNarrativeSynthesis = vi.fn().mockResolvedValueOnce({
      output: validOutput(['SCHOENFELD_2017_DOSE_RESPONSE']),
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
      usage: mockUsage,
    });
    const provider = makeMockProvider(generateNarrativeSynthesis);

    const result = await synthesizeNarratives(baseInput, provider, 'req-1');

    if (result.narratives_unavailable) throw new Error('expected success');
    const matching = result.citations.filter(
      (c) => c.code === 'SCHOENFELD_2017_DOSE_RESPONSE',
    );
    expect(matching).toHaveLength(1);
    expect(matching[0]!.referenced_by).toEqual(
      expect.arrayContaining(['overall', 'phase:phase-1']),
    );
    expect(matching[0]!.author).toBeDefined();
    expect(matching[0]!.year).toBeDefined();
  });
});

describe('provider selection wires generateNarrativeSynthesis for both providers', () => {
  const baseConfig: AppConfig = {
    nodeEnv: 'test',
    appVersion: '0.1.0',
    allowedOrigins: [],
    logLevel: 'error',
    supabaseUrl: 'https://example.supabase.co',
    supabaseAnonKey: 'anon',
    supabaseServiceRoleKey: 'service-role',
    openaiApiKey: null,
    openaiModel: null,
    openaiTimeoutMs: 20000,
    openaiMaxRetries: 1,
    llmRefinementEnabled: false,
    generationTimeoutMs: 60000,
    defaultPlannerVersion: 'legacy_v1',
    longitudinalPlannerEnabled: false,
    aiAgentPlannerEnabled: false,
    openaiGenerationModel: null,
    openaiGenerationTimeoutMs: 45000,
    aiGenerationProvider: 'openai',
    anthropicApiKey: null,
    anthropicModel: null,
    anthropicTimeoutMs: 45000,
    allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
    rateLimitStrategyPerDay: 10,
    openaiStrategyModel: 'gpt-4o-mini',
  };

  it('AI_GENERATION_PROVIDER=openai exposes generateNarrativeSynthesis on the OpenAI provider', () => {
    const provider = getProvider({
      ...baseConfig,
      aiGenerationProvider: 'openai',
      openaiApiKey: 'test-openai-key',
      openaiGenerationModel: 'gpt-4o',
    });

    expect(typeof provider.generateNarrativeSynthesis).toBe('function');
  });

  it('AI_GENERATION_PROVIDER=anthropic exposes generateNarrativeSynthesis on the Anthropic provider', () => {
    const provider = getProvider({
      ...baseConfig,
      aiGenerationProvider: 'anthropic',
      anthropicApiKey: 'test-anthropic-key',
      anthropicModel: 'claude-sonnet-4-6',
    });

    expect(typeof provider.generateNarrativeSynthesis).toBe('function');
  });
});
