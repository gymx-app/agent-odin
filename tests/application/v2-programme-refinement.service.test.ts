import { describe, expect, it, vi } from 'vitest';
import {
  refineV2Programme,
  type V2RefineProgrammeResult,
} from '../../src/application/v2-programme-refinement.service.js';
import type { V2ProgrammeRefinementProvider } from '../../src/llm/v2-programme-refinement-provider.js';
import { refinementError } from '../../src/llm/refinement-errors.js';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile } from '../planning/test-planning-utils.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import * as policyModule from '../../src/llm/v2-refinement-policy.js';
import type {
  V2RefinementProposal,
  V2RefinementResult,
} from '../../src/llm/v2-refinement.types.js';

const profile = createProfile({
  equipment: 'full_gym',
  available_days_per_week: 3,
  session_duration_min: 60,
});

const baseline = validLongitudinalProgramme;

const baselineValidation = programmeValidationService.validateVersioned({
  programme: baseline,
  profile,
  exercises: seedExercises,
});

const firstConditioning = baseline.phases[0]!.weeks[0]!.days.flatMap(
  (d) => d.conditioning,
).find(Boolean)!;

const v2Result = (proposal: V2RefinementProposal): V2RefinementResult => ({
  proposal,
  provider: 'openai',
  model: 'test-model',
  responseId: 'resp-1',
  usage: { inputTokens: 100, outputTokens: 20 },
});

describe('refineV2Programme', () => {
  it('skips provider in deterministic mode', async () => {
    const provider = {
      proposeV2Refinement: vi.fn(),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'deterministic',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-1',
    });

    expect(provider.proposeV2Refinement).not.toHaveBeenCalled();
    expect(result.source).toBe('deterministic');
    expect(result.refinement.status).toBe('not_requested');
  });

  it('accepts a valid conditioning reduction', async () => {
    vi.spyOn(policyModule, 'compareV2ProgrammeValidation').mockReturnValue({
      accepted: true,
      reasonCode: null,
    });

    const provider = {
      proposeV2Refinement: vi.fn(async () =>
        v2Result({
          decision: 'refine',
          summary: 'Reduce conditioning.',
          confidence: 'high',
          operations: [
            {
              operation_id: 'op-cond',
              operation_type: 'reduce_conditioning_duration' as const,
              target_id: firstConditioning.conditioning_id,
              new_value: firstConditioning.duration_min - 5,
              reason_code: 'SESSION_TIME_FIT' as const,
              reason: 'Reduce time.',
            },
          ],
        }),
      ),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-2',
    });

    expect(result.refinement.applied).toBe(true);
    expect(result.refinement.status).toBe('applied');
    expect(result.refinement.operation_count).toBe(1);
    expect(result.refinement.accepted_operation_types).toContain(
      'reduce_conditioning_duration',
    );
    expect(result.source).toBe('llm_refined');

    vi.restoreAllMocks();
  });

  it('falls back on provider error in optional mode', async () => {
    const provider = {
      proposeV2Refinement: vi.fn(async () => {
        throw refinementError('LLM_PROVIDER_ERROR', 'Provider down.');
      }),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-3',
    });

    expect(result.source).toBe('deterministic');
    expect(result.refinement.status).toBe('fallback');
  });

  it('fails safely in required mode when no provider', async () => {
    await expect(
      refineV2Programme({
        mode: 'llm_required',
        baseline,
        baselineValidation,
        profile,
        exercises: seedExercises,
        configuredModel: null,
        requestId: 'req-4',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_REQUIRED_REFINEMENT_FAILED',
    });
  });

  it('retries once on correctable failure then falls back', async () => {
    const provider = {
      proposeV2Refinement: vi.fn(async () =>
        v2Result({
          decision: 'refine',
          summary: 'Bad reference.',
          confidence: 'high',
          operations: [
            {
              operation_id: 'op-bad',
              operation_type: 'reduce_conditioning_duration' as const,
              target_id: 'nonexistent-conditioning-id',
              new_value: 10,
              reason_code: 'SESSION_TIME_FIT' as const,
              reason: 'Invalid target.',
            },
          ],
        }),
      ),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-5',
    });

    expect(provider.proposeV2Refinement).toHaveBeenCalledTimes(2);
    expect(result.refinement.status).toBe('fallback');
    expect(result.refinement.retry_attempted).toBe(true);
  });

  it('accepts no_change proposal', async () => {
    const provider = {
      proposeV2Refinement: vi.fn(async () =>
        v2Result({
          decision: 'no_change',
          summary: 'Programme is already good.',
          confidence: 'high',
          operations: [],
        }),
      ),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-6',
    });

    expect(result.source).toBe('deterministic');
    expect(result.refinement.status).toBe('applied');
    expect(result.refinement.operation_count).toBe(0);
  });

  it('falls back when no provider in optional mode', async () => {
    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      configuredModel: null,
      unavailableReason: 'LLM_REFINEMENT_DISABLED',
      requestId: 'req-7',
    });

    expect(result.refinement.reason_code).toBe('LLM_REFINEMENT_DISABLED');
    expect(result.source).toBe('deterministic');
  });

  it('fails in required mode after retry failure', async () => {
    const provider = {
      proposeV2Refinement: vi.fn(async () =>
        v2Result({
          decision: 'refine',
          summary: 'Always bad.',
          confidence: 'high',
          operations: [
            {
              operation_id: 'op-always-bad',
              operation_type: 'reduce_conditioning_duration' as const,
              target_id: 'nonexistent-id',
              new_value: 10,
              reason_code: 'SESSION_TIME_FIT' as const,
              reason: 'Bad reference.',
            },
          ],
        }),
      ),
    } satisfies V2ProgrammeRefinementProvider;

    await expect(
      refineV2Programme({
        mode: 'llm_required',
        baseline,
        baselineValidation,
        profile,
        exercises: seedExercises,
        provider,
        configuredModel: 'test-model',
        requestId: 'req-8',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_REQUIRED_REFINEMENT_FAILED',
    });
    expect(provider.proposeV2Refinement).toHaveBeenCalledTimes(2);
  });

  it('preserves V2 refinement metadata shape', async () => {
    vi.spyOn(policyModule, 'compareV2ProgrammeValidation').mockReturnValue({
      accepted: true,
      reasonCode: null,
    });

    const provider = {
      proposeV2Refinement: vi.fn(async () =>
        v2Result({
          decision: 'refine',
          summary: 'Reduce conditioning.',
          confidence: 'high',
          operations: [
            {
              operation_id: 'op-meta',
              operation_type: 'reduce_conditioning_duration' as const,
              target_id: firstConditioning.conditioning_id,
              new_value: firstConditioning.duration_min - 5,
              reason_code: 'SESSION_TIME_FIT' as const,
              reason: 'Reduce time.',
            },
          ],
        }),
      ),
    } satisfies V2ProgrammeRefinementProvider;

    const result = await refineV2Programme({
      mode: 'llm_optional',
      baseline,
      baselineValidation,
      profile,
      exercises: seedExercises,
      provider,
      configuredModel: 'test-model',
      requestId: 'req-meta',
    });

    expect(result.refinement).toMatchObject({
      requested: true,
      attempted: true,
      applied: true,
      retry_attempted: false,
      operation_count: 1,
      accepted_operation_types: ['reduce_conditioning_duration'],
      status: 'applied',
      reason_code: null,
    });

    vi.restoreAllMocks();
  });
});
