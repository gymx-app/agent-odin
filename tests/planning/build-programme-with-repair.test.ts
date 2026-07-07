import { describe, expect, it, vi } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import {
  buildLongitudinalProgramme,
  buildProgrammeWithRepair,
} from '../../src/planning/longitudinal-programme-planner.js';
import { PlannerError } from '../../src/planning/planner-errors.js';
import type { AiProgrammeGenerationProvider } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { AiStrategyOutput } from '../../src/llm/ai-generation/ai-generation.types.js';

const buildFixture = () => {
  const profile = normalizeAthlete(beginnerFatLossAthlete);
  const { programme } = buildLongitudinalProgramme(profile, seedExercises, {
    startDate: '2026-06-22',
    generatedAt: '2026-06-22T00:00:00.000Z',
    exerciseLibraryVersion: 'test-v1',
  });

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

  return { profile, strategy };
};

describe('buildProgrammeWithRepair — deadline enforcement', () => {
  it('fails fast without calling the provider again once the deadline has passed', async () => {
    const { profile, strategy } = buildFixture();
    const generateStrategy = vi.fn(async () => ({
      output: strategy,
      provider: 'openai' as const,
      model: 'test-model',
      responseId: 'resp-repair',
      usage: { inputTokens: 100, outputTokens: 100 },
    }));
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy,
      generatePhase: vi.fn(),
    };

    await expect(
      buildProgrammeWithRepair(
        profile,
        // Empty exercise library forces buildProgrammeFromAiStrategy to fail
        // (no eligible exercises to prescribe), triggering the repair path.
        [],
        strategy,
        provider,
        { athlete: profile.source, evidence_rules: [], exercise_library_summary: [] } as never,
        {
          startDate: '2026-06-22',
          deadline: Date.now() - 1000,
        },
      ),
    ).rejects.toMatchObject({ code: 'PROGRAMME_GENERATION_DEADLINE_EXCEEDED' });

    expect(generateStrategy).not.toHaveBeenCalled();
  });

  it('reports each repair attempt via onRepairAttempt', async () => {
    const { profile, strategy } = buildFixture();
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy: vi.fn(async () => ({
        output: strategy,
        provider: 'openai' as const,
        model: 'test-model',
        responseId: 'resp-repair',
        usage: { inputTokens: 100, outputTokens: 100 },
      })),
      generatePhase: vi.fn(),
    };
    const onRepairAttempt = vi.fn();

    await buildProgrammeWithRepair(
      profile,
      seedExercises,
      strategy,
      provider,
      { athlete: profile.source, evidence_rules: [], exercise_library_summary: [] } as never,
      { startDate: '2026-06-22', onRepairAttempt },
    );

    expect(onRepairAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ attempt: 0, outcome: 'succeeded' }),
    );
  });
});
