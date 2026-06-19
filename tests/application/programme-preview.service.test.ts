import { describe, expect, it, vi } from 'vitest';
import {
  beginnerFatLossAthlete,
  enrichedRecompositionAthlete,
} from '../../fixtures/athletes/valid-athletes.js';
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

  it('routes an explicit legacy request through the unchanged V1 planner', async () => {
    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-explicit-legacy',
        exercises: seedExercises,
        requestedPlannerVersion: 'legacy_v1',
        defaultPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: true,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
      },
    );

    expect(result.planner_version).toBe('legacy_v1');
    expect(result.schema_version).toBe('1.0');
    expect('phase_week_templates' in result.programme).toBe(true);
    expect(result.generation.planner_resolution.reason_code).toBe(
      'PLANNER_VERSION_REQUESTED',
    );
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
    expect(result.planner_version).toBe('legacy_v1');
    if ('phase_week_templates' in result.programme) {
      result.programme.phase_week_templates[0]?.days.forEach((day) => {
        const exerciseIds = day.exercises.map(
          (exercise) => exercise.exercise_id,
        );
        expect(new Set(exerciseIds).size).toBe(exerciseIds.length);
      });
    }
  });

  it('accepts enriched athlete input without changing preview response shape', async () => {
    const result = await previewProgramme(
      enrichedRecompositionAthlete,
      'deterministic',
      {
        requestId: 'req-enriched-preview',
        exercises: seedExercises,
      },
    );

    expect(result.validation.passed).toBe(true);
    expect(Object.keys(result).sort()).toEqual([
      'generation',
      'planner_version',
      'programme',
      'refinement',
      'schema_version',
      'source',
      'validation',
    ]);
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

  it('generates longitudinal V2 when explicitly requested and enabled', async () => {
    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      {
        requestId: 'req-v2-preview',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        defaultPlannerVersion: 'legacy_v1',
        longitudinalPlannerEnabled: true,
        allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
        startDate: '2026-06-22',
        generatedAt: '2026-06-19T05:30:00.000Z',
      },
    );

    expect(result.planner_version).toBe('longitudinal_v1');
    expect(result.schema_version).toBe('2.0');
    expect('schema_version' in result.programme).toBe(true);
    expect(result.validation.passed).toBe(true);
    expect(result.generation.planner_resolution.reason_code).toBe(
      'PLANNER_VERSION_REQUESTED',
    );
  });

  it('returns explicit optional-refinement fallback metadata for V2', async () => {
    const result = await previewProgramme(
      beginnerFatLossAthlete,
      'llm_optional',
      {
        requestId: 'req-v2-optional',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: true,
        startDate: '2026-06-22',
        generatedAt: '2026-06-19T05:30:00.000Z',
      },
    );

    expect(result.source).toBe('deterministic');
    expect(result.refinement).toMatchObject({
      requested: true,
      applied: false,
      status: 'fallback',
      reason_code: 'REFINEMENT_UNSUPPORTED_FOR_PLANNER_VERSION',
    });
  });

  it('returns identical V2 output for fixed inputs and injected dates', async () => {
    const context = {
      requestId: 'req-v2-determinism',
      exercises: seedExercises,
      requestedPlannerVersion: 'longitudinal_v1' as const,
      longitudinalPlannerEnabled: true,
      startDate: '2026-06-22',
      generatedAt: '2026-06-19T05:30:00.000Z',
    };

    const first = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      context,
    );
    const second = await previewProgramme(
      beginnerFatLossAthlete,
      'deterministic',
      context,
    );

    expect({
      ...first,
      generation: { ...first.generation, stage_durations_ms: {} },
    }).toEqual({
      ...second,
      generation: { ...second.generation, stage_durations_ms: {} },
    });
  });

  it('fails required refinement safely for V2', async () => {
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'llm_required', {
        requestId: 'req-v2-required',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: true,
        startDate: '2026-06-22',
      }),
    ).rejects.toMatchObject({
      code: 'LLM_REFINEMENT_UNSUPPORTED_FOR_PLANNER_VERSION',
    });
  });

  it('rejects longitudinal requests while the rollout is disabled', async () => {
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'deterministic', {
        requestId: 'req-v2-disabled',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: false,
      }),
    ).rejects.toMatchObject({ code: 'PLANNER_VERSION_DISABLED' });
  });

  it('enforces the deadline at stage boundaries without returning partial V2 output', async () => {
    let clock = 0;
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'deterministic', {
        requestId: 'req-v2-timeout',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: true,
        generationTimeoutMs: 5,
        startDate: '2026-06-22',
        now: () => {
          clock += 2;
          return clock;
        },
      }),
    ).rejects.toMatchObject({
      code: 'GENERATION_TIMEOUT',
      details: expect.objectContaining({
        planner_version: 'longitudinal_v1',
      }),
    });
  });

  it('returns no programme when the V2 generator reports failed final validation', async () => {
    await expect(
      previewProgramme(beginnerFatLossAthlete, 'deterministic', {
        requestId: 'req-v2-invalid',
        exercises: seedExercises,
        requestedPlannerVersion: 'longitudinal_v1',
        longitudinalPlannerEnabled: true,
        startDate: '2026-06-22',
        longitudinalGenerator: () => ({
          programme: {} as never,
          validation: {
            passed: false,
            status: 'fail',
            overall_score: 0,
            scores: {
              structure: 0,
              constraint_fit: 0,
              exercise_integrity: 0,
              movement_balance: 0,
              recovery_fit: 0,
              fatigue_management: 0,
              goal_specificity: 0,
              progression_quality: 0,
              session_time_fit: 0,
              prescription_quality: 0,
              naming_quality: 0,
            },
            findings: [],
            summary: {
              error_count: 1,
              warning_count: 0,
              info_count: 0,
            },
          },
        }),
      }),
    ).rejects.toMatchObject({
      code: 'GENERATED_PROGRAMME_INVALID',
      details: {
        status: 'fail',
        summary: {
          error_count: 1,
          warning_count: 0,
          info_count: 0,
        },
      },
    });
  });
});
