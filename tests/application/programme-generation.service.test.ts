import { describe, expect, it, vi } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';
import { generateProgrammeForUser } from '../../src/application/programme-generation.service.js';
import type { SavedProgramme } from '../../src/repositories/repository.types.js';
import type { ProgrammeRefinementProvider } from '../../src/llm/programme-refinement-provider.js';
import { proposal } from '../llm/test-refinement.js';

const createContext = () => {
  const saved: { value: SavedProgramme | null } = { value: null };

  const athleteProfiles = {
    getByUserId: vi.fn(async () => beginnerFatLossAthlete),
  };
  const exercises = {
    loadActiveApproved: vi.fn(async () => seedExercises),
  };
  const programmes = {
    getById: vi.fn(async () => saved.value),
    createWithVersion: vi.fn(async (input) => {
      saved.value = {
        id: 'programme-1',
        userId: input.userId,
        version: 1,
        name: input.programme.programme.name,
        goalType: input.programme.programme.goal_type,
        status: input.status,
        source: input.source,
        programme: input.programme,
        validation: input.validation,
        refinement: input.refinement,
      };

      return saved.value;
    }),
  };
  const agentRuns = {
    start: vi.fn(async () => ({
      id: 'run-1',
      userId: 'user-1',
      requestId: 'req-1',
    })),
    markSucceeded: vi.fn(async () => undefined),
    markFailed: vi.fn(async () => undefined),
  };

  return {
    requestId: 'req-1',
    athleteProfiles,
    exercises,
    programmes,
    agentRuns,
  };
};

describe('generateProgrammeForUser', () => {
  it('runs the deterministic pipeline and saves a draft programme with version 1', async () => {
    const context = createContext();
    const result = await generateProgrammeForUser(
      'user-1',
      { replace_existing_draft: false, refinement_mode: 'deterministic' },
      context,
    );

    expect(result.replayed).toBe(false);
    expect(result.saved.version).toBe(1);
    expect(result.saved.status).toBe('draft');
    expect(result.saved.source).toBe('deterministic');
    expect(result.saved.validation.passed).toBe(true);
    expect(context.programmes.createWithVersion).toHaveBeenCalledWith(
      expect.objectContaining({
        replaceExistingDraft: false,
      }),
    );
    expect(context.agentRuns.markSucceeded).toHaveBeenCalledWith(
      'run-1',
      { programme_id: 'programme-1', version: 1 },
      expect.objectContaining({
        status: expect.stringMatching(/^pass/),
      }),
      expect.any(Number),
    );
  });

  it('records a failed run and does not save a programme when validation fails', async () => {
    const context = createContext();

    context.exercises.loadActiveApproved.mockResolvedValue(
      seedExercises.map((exercise) =>
        exercise.id === 'bodyweight_squat'
          ? { ...exercise, status: 'deprecated' }
          : exercise,
      ),
    );

    await expect(
      generateProgrammeForUser(
        'user-1',
        { replace_existing_draft: false, refinement_mode: 'deterministic' },
        context,
      ),
    ).rejects.toMatchObject({
      code: 'EXERCISE_LIBRARY_INVALID',
    });
    expect(context.programmes.createWithVersion).not.toHaveBeenCalled();
    expect(context.agentRuns.markFailed).toHaveBeenCalledWith(
      'run-1',
      'EXERCISE_LIBRARY_INVALID',
      'Exercise library failed validation.',
      expect.any(Number),
    );
  });

  it('marks a claimed idempotency request failed when generation fails', async () => {
    const context = createContext();
    const idempotency = {
      claim: vi.fn(async () => ({ type: 'started' as const })),
      markFailed: vi.fn(async () => undefined),
    };
    context.exercises.loadActiveApproved.mockRejectedValue(
      new Error('storage unavailable'),
    );

    await expect(
      generateProgrammeForUser(
        'user-1',
        {
          replace_existing_draft: false,
          refinement_mode: 'deterministic',
          idempotencyKey: 'idem-1',
        },
        { ...context, idempotency },
      ),
    ).rejects.toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });

    expect(idempotency.markFailed).toHaveBeenCalledWith(
      'user-1',
      '/api/odin/generate',
      'idem-1',
      expect.stringMatching(/^[a-f0-9]{64}$/),
    );
  });

  it('replays an idempotent result without creating a duplicate programme', async () => {
    const context = createContext();
    const saved = await generateProgrammeForUser(
      'user-1',
      { replace_existing_draft: true, refinement_mode: 'deterministic' },
      context,
    );
    const idempotency = {
      claim: vi.fn(async () => ({
        type: 'replay' as const,
        responseReference: { programme_id: saved.saved.id },
      })),
      markFailed: vi.fn(async () => undefined),
    };

    context.programmes.getById.mockResolvedValue(saved.saved);

    const replay = await generateProgrammeForUser(
      'user-1',
      {
        replace_existing_draft: true,
        refinement_mode: 'deterministic',
        idempotencyKey: 'idem-1',
      },
      {
        ...context,
        idempotency,
      },
    );

    expect(replay.replayed).toBe(true);
    expect(context.programmes.createWithVersion).toHaveBeenCalledTimes(1);
  });

  it('does not call the refinement provider during replay', async () => {
    const context = createContext();
    const provider = {
      proposeRefinement: vi.fn(),
    } satisfies ProgrammeRefinementProvider;
    const saved = {
      id: 'programme-1',
      userId: 'user-1',
      version: 1,
      name: 'Fat Loss Base',
      goalType: 'fat_loss' as const,
      status: 'draft' as const,
      source: 'deterministic' as const,
      programme: null,
      validation: null,
      refinement: null,
    };
    context.programmes.getById.mockResolvedValue(
      saved as unknown as SavedProgramme,
    );

    await generateProgrammeForUser(
      'user-1',
      {
        replace_existing_draft: false,
        refinement_mode: 'llm_optional',
        idempotencyKey: 'idem-1',
      },
      {
        ...context,
        refinementProvider: provider,
        idempotency: {
          claim: vi.fn(async () => ({
            type: 'replay' as const,
            responseReference: { programme_id: 'programme-1' },
          })),
          markFailed: vi.fn(async () => undefined),
        },
      },
    );

    expect(provider.proposeRefinement).not.toHaveBeenCalled();
    expect(context.programmes.createWithVersion).not.toHaveBeenCalled();
  });

  it('persists accepted optional refinement metadata and source', async () => {
    const context = createContext();
    const provider = {
      proposeRefinement: vi.fn(async () => ({
        proposal: proposal([]),
        provider: 'openai' as const,
        model: 'configured-model',
        responseId: 'resp-1',
        usage: { inputTokens: 100, outputTokens: 20 },
      })),
    } satisfies ProgrammeRefinementProvider;
    const result = await generateProgrammeForUser(
      'user-1',
      {
        replace_existing_draft: true,
        refinement_mode: 'llm_optional',
      },
      {
        ...context,
        refinementProvider: provider,
        configuredModel: 'configured-model',
      },
    );

    expect(provider.proposeRefinement).toHaveBeenCalledTimes(1);
    expect(result.saved.source).toBe('deterministic');
    expect(result.saved.refinement).toMatchObject({
      requested: true,
      applied: false,
      status: 'accepted',
      model: 'configured-model',
    });
  });
});
