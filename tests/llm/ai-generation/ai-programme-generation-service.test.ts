import { describe, expect, it, vi } from 'vitest';
import { createProfile } from '../../planning/test-planning-utils.js';
import { seedExercises } from '../../../fixtures/exercises/seed-exercises.js';
import {
  generateAiProgramme,
  AiGenerationError,
} from '../../../src/llm/ai-generation/ai-programme-generation.service.js';
import type { AiProgrammeGenerationProvider } from '../../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type {
  AiStrategyOutput,
  AiPhaseOutput,
} from '../../../src/llm/ai-generation/ai-generation.types.js';
import { buildLongitudinalProgramme } from '../../../src/planning/longitudinal-programme-planner.js';

vi.mock(
  '../../../src/llm/ai-generation/validate-phase-in-isolation.js',
  () => ({
    validatePhaseInIsolation: () => [],
  }),
);

const profile = createProfile({
  available_days_per_week: 3,
  session_duration_min: 45,
});

const buildRealProgramme = () => {
  const result = buildLongitudinalProgramme(profile, seedExercises, {
    startDate: '2026-06-22',
    generatedAt: '2026-06-22T00:00:00.000Z',
    exerciseLibraryVersion: 'test-v1',
  });
  return result.programme;
};

const createMockProvider = (
  programme: ReturnType<typeof buildRealProgramme>,
): AiProgrammeGenerationProvider => {
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
    phase_skeletons: programme.phases.map((phase) => ({
      phase_id: phase.phase_id,
      phase_number: phase.phase_number,
      name: phase.name,
      phase_type: phase.phase_type,
      objective: phase.objective,
      start_week: phase.start_week,
      end_week: phase.end_week,
      weeks_count: phase.weeks_count,
      volume_direction: phase.volume_direction,
      intensity_direction: phase.intensity_direction,
      effort_direction: phase.effort_direction,
      progression_model: phase.progression_model,
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
      responseId: 'resp-strategy',
      usage: { inputTokens: 1000, outputTokens: 500 },
    })),
    generatePhase: vi.fn(async (context) => {
      const phaseNum = context.phase_skeleton.phase_number;
      const phase = phasesByNumber.get(phaseNum)!;
      return {
        output: phase as AiPhaseOutput,
        provider: 'openai' as const,
        model: 'test-model',
        responseId: `resp-phase-${phaseNum}`,
        usage: { inputTokens: 2000, outputTokens: 4000 },
      };
    }),
  };
};

describe('generateAiProgramme', () => {
  it('calls generateStrategy once and generatePhase for each phase skeleton', async () => {
    const programme = buildRealProgramme();
    const provider = createMockProvider(programme);

    const result = await generateAiProgramme({
      profile,
      exercises: seedExercises,
      provider,
      requestId: 'req-test',
      startDate: '2026-06-22',
      exerciseLibraryVersion: 'test-v1',
    });

    expect(provider.generateStrategy).toHaveBeenCalledTimes(1);
    expect(provider.generatePhase).toHaveBeenCalledTimes(
      programme.phases.length,
    );
    expect(result.phases).toHaveLength(programme.phases.length);
    expect(result.programme.schema_version).toBe('2.0');
    expect(result.programme.generation_metadata.deterministic).toBe(false);
  });

  it('tracks token usage across all calls', async () => {
    const programme = buildRealProgramme();
    const provider = createMockProvider(programme);

    const result = await generateAiProgramme({
      profile,
      exercises: seedExercises,
      provider,
      requestId: 'req-tokens',
      startDate: '2026-06-22',
      exerciseLibraryVersion: 'test-v1',
    });

    expect(result.total_input_tokens).toBe(
      1000 + 2000 * programme.phases.length,
    );
    expect(result.total_output_tokens).toBe(
      500 + 4000 * programme.phases.length,
    );
  });

  it('records stage durations for strategy and each phase', async () => {
    const programme = buildRealProgramme();
    const provider = createMockProvider(programme);

    const result = await generateAiProgramme({
      profile,
      exercises: seedExercises,
      provider,
      requestId: 'req-durations',
      startDate: '2026-06-22',
      exerciseLibraryVersion: 'test-v1',
    });

    expect(result.stage_durations_ms).toHaveProperty('strategy');
    for (let i = 1; i <= programme.phases.length; i++) {
      expect(result.stage_durations_ms).toHaveProperty(`phase_${i}`);
    }
  });

  it('throws AiGenerationError when strategy generation fails', async () => {
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy: vi.fn(async () => {
        throw new Error('LLM_PROVIDER_ERROR: unavailable');
      }),
      generatePhase: vi.fn(),
    };

    await expect(
      generateAiProgramme({
        profile,
        exercises: seedExercises,
        provider,
        requestId: 'req-fail',
        startDate: '2026-06-22',
        exerciseLibraryVersion: 'test-v1',
      }),
    ).rejects.toThrow();
  });

  it('enforces deadline and throws AI_GENERATION_TIMEOUT', async () => {
    const programme = buildRealProgramme();
    const provider = createMockProvider(programme);
    let clock = 0;

    await expect(
      generateAiProgramme({
        profile,
        exercises: seedExercises,
        provider,
        requestId: 'req-timeout',
        startDate: '2026-06-22',
        exerciseLibraryVersion: 'test-v1',
        deadline: 5,
        now: () => {
          clock += 10;
          return clock;
        },
      }),
    ).rejects.toMatchObject({
      code: 'AI_GENERATION_TIMEOUT',
    });
  });
});
