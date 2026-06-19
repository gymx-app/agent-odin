import { describe, expect, it, vi } from 'vitest';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { previewProgramme } from '../../src/application/programme-preview.service.js';
import type { ProgrammeRefinementProvider } from '../../src/llm/programme-refinement-provider.js';
import { proposal } from '../llm/test-refinement.js';

describe('previewProgramme', () => {
  it('returns a validated deterministic programme without persistence metadata', async () => {
    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-preview',
        exercises: seedExercises,
      },
    );

    expect(result.source).toBe('deterministic');
    expect(result.validation.passed).toBe(true);
    expect(result.programme.validation_summary.passed).toBe(true);
    expect(result.refinement).toMatchObject({
      requested: false,
      applied: false,
      status: 'not_requested',
    });
    expect(result).not.toHaveProperty('programme_id');
    expect(result).not.toHaveProperty('version');
    expect(result).not.toHaveProperty('status');
  });

  it('supports bounded optional refinement without persistence', async () => {
    const provider = {
      proposeRefinement: vi.fn(async () => ({
        proposal: proposal([]),
        provider: 'openai' as const,
        model: 'configured-model',
        responseId: 'resp-preview',
        usage: { inputTokens: 100, outputTokens: 20 },
      })),
    } satisfies ProgrammeRefinementProvider;

    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'llm_optional',
      {
        requestId: 'req-preview',
        exercises: seedExercises,
        refinementProvider: provider,
        configuredModel: 'configured-model',
      },
    );

    expect(provider.proposeRefinement).toHaveBeenCalledTimes(1);
    expect(result.validation.passed).toBe(true);
    expect(result.refinement).toMatchObject({
      requested: true,
      status: 'accepted',
      model: 'configured-model',
    });
  });

  it('returns a valid preview for the demo UI default profile', async () => {
    const result = await previewProgramme(
      {
        name: 'Alex Morgan',
        age: 32,
        sex: 'male',
        current_weight_kg: 84,
        target_weight_kg: 79,
        height_cm: 180,
        goal: 'recomposition',
        available_days_per_week: 4,
        session_duration_min: 60,
        equipment: 'full_gym',
        fitness_level: 'intermediate',
        injuries: [],
        inbody: null,
      },
      'deterministic',
      {
        requestId: 'req-demo-preview',
        exercises: seedExercises,
      },
    );

    expect(result.validation.passed).toBe(true);
    result.programme.phase_week_templates[0]?.days.forEach((day) => {
      const exerciseIds = day.exercises.map(
        (exercise) => exercise.exercise_id,
      );
      expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
    });
  });

  it('fails safely when the bundled exercise library is invalid', async () => {
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'deterministic', {
        requestId: 'req-preview',
        exercises: [],
      }),
    ).rejects.toMatchObject({
      code: 'EXERCISE_LIBRARY_INVALID',
    });
  });
});
