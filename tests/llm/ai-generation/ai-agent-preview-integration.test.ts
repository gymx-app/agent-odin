import { describe, expect, it, vi } from 'vitest';
import { beginnerFatLossAthlete } from '../../../fixtures/athletes/valid-athletes.js';
import { seedExercises } from '../../../fixtures/exercises/seed-exercises.js';
import { previewProgramme } from '../../../src/application/programme-preview.service.js';
import type { AiProgrammeGenerationProvider } from '../../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { AiPhaseOutput, AiStrategyOutput } from '../../../src/llm/ai-generation/ai-generation.types.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { buildLongitudinalProgramme } from '../../../src/planning/longitudinal-programme-planner.js';

vi.mock(
  '../../../src/llm/ai-generation/validate-phase-in-isolation.js',
  () => ({
    validatePhaseInIsolation: () => [],
  }),
);

const buildMockProvider = (): AiProgrammeGenerationProvider => {
  const profile = normalizeAthlete(beginnerFatLossAthlete);
  const result = buildLongitudinalProgramme(profile, seedExercises, {
    startDate: '2026-06-22',
    generatedAt: '2026-06-22T00:00:00.000Z',
    exerciseLibraryVersion: 'test-v1',
  });
  const programme = result.programme;

  const strategy: AiStrategyOutput = {
    programme: {
      name: programme.programme.name,
      goal_type: programme.programme.goal_type,
      goal_description: programme.programme.goal_description,
      target_weeks: programme.programme.target_weeks,
    },
    athlete_summary: programme.athlete_summary,
    strategy: programme.strategy,
    calendar: programme.calendar,
    phase_skeletons: programme.phases.map((p) => ({
      phase_id: p.phase_id,
      phase_number: p.phase_number,
      name: p.name,
      phase_type: p.phase_type,
      objective: p.objective,
      start_week: p.start_week,
      end_week: p.end_week,
      weeks_count: p.weeks_count,
      volume_direction: p.volume_direction,
      intensity_direction: p.intensity_direction,
      effort_direction: p.effort_direction,
      progression_model: p.progression_model,
    })),
    progression_policy: programme.progression_policy,
    fatigue_management_policy: programme.fatigue_management_policy,
    substitution_policy: programme.substitution_policy,
    conditioning_policy: programme.conditioning_policy,
    assumptions: programme.assumptions,
    review_triggers: programme.review_triggers,
  };

  const phasesByNumber = new Map(
    programme.phases.map((p) => [p.phase_number, p]),
  );

  return {
    generateStrategy: vi.fn(async () => ({
      output: strategy,
      provider: 'openai' as const,
      model: 'test-model',
      responseId: 'resp-s',
      usage: { inputTokens: 500, outputTokens: 300 },
    })),
    generatePhase: vi.fn(async (context) => {
      const phaseNum = context.phase_skeleton.phase_number;
      const phase = phasesByNumber.get(phaseNum)!;
      return {
        output: phase as AiPhaseOutput,
        provider: 'openai' as const,
        model: 'test-model',
        responseId: `resp-p-${phaseNum}`,
        usage: { inputTokens: 1000, outputTokens: 2000 },
      };
    }),
  };
};

describe('previewProgramme with ai_agent_v1', () => {
  it('produces ai_generated output with valid programme via mock provider', async () => {
    const provider = buildMockProvider();

    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-ai-integration',
        exercises: seedExercises,
        requestedPlannerVersion: 'ai_agent_v1',
        aiAgentPlannerEnabled: true,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'],
        aiGenerationProvider: provider,
        startDate: '2026-06-22',
        exerciseLibraryVersion: 'test-v1',
      },
    );

    expect(result.source).toBe('ai_generated');
    expect(result.planner_version).toBe('ai_agent_v1');
    expect(result.schema_version).toBe('2.0');
    expect(result.generation.ai_generation).toBeDefined();
    expect(result.generation.ai_generation!.fallback_used).toBe(false);
    expect(result.generation.ai_generation!.total_input_tokens).toBeGreaterThan(0);
    expect(provider.generateStrategy).toHaveBeenCalledTimes(1);
  });

  it('falls back to deterministic when no provider is supplied', async () => {
    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-ai-no-provider',
        exercises: seedExercises,
        requestedPlannerVersion: 'ai_agent_v1',
        aiAgentPlannerEnabled: true,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'],
        startDate: '2026-06-22',
        exerciseLibraryVersion: 'test-v1',
      },
    );

    expect(result.source).toBe('deterministic');
    expect(result.planner_version).toBe('ai_agent_v1');
    expect(result.generation.ai_generation).toBeDefined();
    expect(result.generation.ai_generation!.fallback_used).toBe(true);
    expect(result.generation.ai_generation!.fallback_reason).toBe(
      'AI_GENERATION_PROVIDER_MISSING',
    );
  });

  it('falls back to deterministic when provider throws', async () => {
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy: vi.fn(async () => {
        throw new Error('provider down');
      }),
      generatePhase: vi.fn(),
    };

    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-ai-error-fallback',
        exercises: seedExercises,
        requestedPlannerVersion: 'ai_agent_v1',
        aiAgentPlannerEnabled: true,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'],
        aiGenerationProvider: provider,
        startDate: '2026-06-22',
        exerciseLibraryVersion: 'test-v1',
      },
    );

    expect(result.source).toBe('deterministic');
    expect(result.planner_version).toBe('ai_agent_v1');
    expect(result.generation.ai_generation!.fallback_used).toBe(true);
  });

  it('rejects ai_agent_v1 when the feature flag is disabled', async () => {
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'deterministic', {
        requestId: 'req-ai-disabled',
        exercises: seedExercises,
        requestedPlannerVersion: 'ai_agent_v1',
        aiAgentPlannerEnabled: false,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'],
      }),
    ).rejects.toMatchObject({ code: 'PLANNER_VERSION_DISABLED' });
  });
});
