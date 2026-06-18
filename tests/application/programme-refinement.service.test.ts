import { describe, expect, it, vi } from 'vitest';
import { refineProgramme } from '../../src/application/programme-refinement.service.js';
import type { ProgrammeRefinementProvider } from '../../src/llm/programme-refinement-provider.js';
import { refinementError } from '../../src/llm/refinement-errors.js';
import {
  operation,
  proposal,
  refinementFixture,
} from '../llm/test-refinement.js';

const result = (proposalValue: ReturnType<typeof proposal>) => ({
  proposal: proposalValue,
  provider: 'openai' as const,
  model: 'configured-model',
  responseId: 'resp-1',
  usage: { inputTokens: 100, outputTokens: 20 },
});

describe('refineProgramme', () => {
  it('does not call the provider in deterministic mode', async () => {
    const fixture = refinementFixture();
    const provider = {
      proposeRefinement: vi.fn(),
    } satisfies ProgrammeRefinementProvider;
    const refined = await refineProgramme({
      mode: 'deterministic',
      baseline: fixture.programme,
      baselineValidation: fixture.validation,
      profile: fixture.profile,
      exercises: fixture.exercises,
      provider,
      configuredModel: 'configured-model',
      requestId: 'req-1',
    });

    expect(provider.proposeRefinement).not.toHaveBeenCalled();
    expect(refined.source).toBe('deterministic');
    expect(refined.refinement.status).toBe('not_requested');
  });

  it('accepts a valid optional refinement', async () => {
    const fixture = refinementFixture();
    const day = fixture.programme.phase_week_templates[0]!.days.find(
      (candidate) => candidate.workout_type === 'workout',
    )!;
    const exercise = day.exercises[0]!;
    const provider = {
      proposeRefinement: vi.fn(async () =>
        result(
          proposal([
            operation({
              type: 'add_coaching_cue',
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
              coaching_cue: 'Keep the movement controlled.',
              reason_code: 'SKILL_LEVEL_FIT',
            }),
          ]),
        ),
      ),
    } satisfies ProgrammeRefinementProvider;

    const refined = await refineProgramme({
      mode: 'llm_optional',
      baseline: fixture.programme,
      baselineValidation: fixture.validation,
      profile: fixture.profile,
      exercises: fixture.exercises,
      provider,
      configuredModel: 'configured-model',
      requestId: 'req-1',
    });

    expect(refined.source).toBe('llm_refined');
    expect(refined.refinement.applied).toBe(true);
  });

  it('falls back on provider refusal without retrying', async () => {
    const fixture = refinementFixture();
    const provider = {
      proposeRefinement: vi.fn(async () => {
        throw refinementError('LLM_PROVIDER_REFUSAL', 'The provider declined.');
      }),
    } satisfies ProgrammeRefinementProvider;

    const refined = await refineProgramme({
      mode: 'llm_optional',
      baseline: fixture.programme,
      baselineValidation: fixture.validation,
      profile: fixture.profile,
      exercises: fixture.exercises,
      provider,
      configuredModel: 'configured-model',
      requestId: 'req-1',
    });

    expect(provider.proposeRefinement).toHaveBeenCalledTimes(1);
    expect(refined.source).toBe('deterministic');
    expect(refined.refinement.reason_code).toBe('LLM_PROVIDER_REFUSAL');
  });

  it('retries one correctable application failure then falls back', async () => {
    const fixture = refinementFixture();
    const day = fixture.programme.phase_week_templates[0]!.days.find(
      (candidate) => candidate.workout_type === 'workout',
    )!;
    const exercise = day.exercises[0]!;
    const provider = {
      proposeRefinement: vi.fn(async () =>
        result(
          proposal([
            operation({
              type: 'adjust_set_count',
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
              new_set_count: exercise.sets.length + 3,
            }),
          ]),
        ),
      ),
    } satisfies ProgrammeRefinementProvider;

    const refined = await refineProgramme({
      mode: 'llm_optional',
      baseline: fixture.programme,
      baselineValidation: fixture.validation,
      profile: fixture.profile,
      exercises: fixture.exercises,
      provider,
      configuredModel: 'configured-model',
      requestId: 'req-1',
    });

    expect(provider.proposeRefinement).toHaveBeenCalledTimes(2);
    expect(refined.refinement.status).toBe('fallback');
  });

  it('fails safely when refinement is required', async () => {
    const fixture = refinementFixture();

    await expect(
      refineProgramme({
        mode: 'llm_required',
        baseline: fixture.programme,
        baselineValidation: fixture.validation,
        profile: fixture.profile,
        exercises: fixture.exercises,
        configuredModel: null,
        requestId: 'req-1',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_REQUIRED_REFINEMENT_FAILED',
    });
  });

  it('reports disabled optional refinement accurately', async () => {
    const fixture = refinementFixture();
    const refined = await refineProgramme({
      mode: 'llm_optional',
      baseline: fixture.programme,
      baselineValidation: fixture.validation,
      profile: fixture.profile,
      exercises: fixture.exercises,
      configuredModel: null,
      unavailableReason: 'LLM_REFINEMENT_DISABLED',
      requestId: 'req-1',
    });

    expect(refined.refinement.reason_code).toBe('LLM_REFINEMENT_DISABLED');
    expect(refined.source).toBe('deterministic');
  });
});
