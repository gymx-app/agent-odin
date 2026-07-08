import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createTestRequest, createTestResponse } from '../infrastructure/test-http.js';
import { createV2Athlete } from './test-athlete-v2.js';
import { createSwapOptionsHandler } from '../../api/odin/swap-options.js';

vi.mock('../../src/infrastructure/supabase/auth-client.js', () => ({
  createSupabaseAuthClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: 'user-1', email: 'athlete@example.com' } },
        error: null,
      }),
    },
  }),
}));

const config: AppConfig = {
  nodeEnv: 'test',
  appVersion: '9.8.7',
  allowedOrigins: ['https://app.example.com'],
  logLevel: 'error',
  supabaseUrl: null,
  supabaseAnonKey: null,
  supabaseServiceRoleKey: null,
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
  aiGenerationProvider: 'openai' as const,
  anthropicApiKey: null,
  anthropicModel: null,
  anthropicTimeoutMs: 45000,
  allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
  rateLimitStrategyPerDay: 10,
  openaiStrategyModel: 'gpt-4o-mini',
};

const postRequest = (body: unknown) =>
  createTestRequest({
    method: 'POST',
    headers: { authorization: 'Bearer test-token' },
    body,
  });

describe('POST /api/odin/swap-options', () => {
  it('uses the precomputed substitution_options without a live search when there are enough resolvable options', async () => {
    const handler = createSwapOptionsHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        substitution_options: {
          approved_exercise_ids: ['band_biceps_curl', 'cable_biceps_curl'],
        },
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    const json = response.json() as {
      data: {
        used_fallback: boolean;
        options: { exercise_id: string; reasons: string[]; score: number }[];
      };
    };

    expect(json.data.used_fallback).toBe(false);
    expect(json.data.options.map((o) => o.exercise_id).sort()).toEqual(
      ['band_biceps_curl', 'cable_biceps_curl'].sort(),
    );
    // Same substitution_group as the source — describeSubstitutionMatch
    // should surface that as a reason, same text findExerciseSubstitutions uses.
    const bandOption = json.data.options.find(
      (o) => o.exercise_id === 'band_biceps_curl',
    );
    expect(bandOption?.reasons).toContain('same substitution group');
    expect(bandOption?.score).toBeGreaterThan(0);
  });

  it('falls back to a live search when the precomputed list is empty', async () => {
    const handler = createSwapOptionsHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        substitution_options: { approved_exercise_ids: [] },
        athlete: createV2Athlete({ equipment: 'full_gym' }),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    const json = response.json() as {
      data: { used_fallback: boolean; options: { exercise_id: string }[] };
    };

    expect(json.data.used_fallback).toBe(true);
    const ids = json.data.options.map((o) => o.exercise_id);
    // Matches the top-ranked result findExerciseSubstitutions already
    // produces for this exact exercise/profile pair (see
    // substitutions.test.ts) — the seed library has many equally-scored
    // elbow_flexion variants, so only the #1 rank is a stable assertion
    // once the live results are capped to the top 5.
    expect(ids).toHaveLength(5);
    expect(ids).toContain('band_biceps_curl');
    expect(ids).not.toContain('dumbbell_biceps_curl');
  });

  it('falls back when substitution_options is omitted entirely', async () => {
    const handler = createSwapOptionsHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect((response.json() as { data: { used_fallback: boolean } }).data.used_fallback).toBe(
      true,
    );
  });

  it('drops unresolvable precomputed IDs and falls back if too few remain', async () => {
    const handler = createSwapOptionsHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        substitution_options: {
          approved_exercise_ids: ['band_biceps_curl', 'deprecated_ghost_exercise'],
        },
        athlete: createV2Athlete(),
      }),
      response,
    );

    const json = response.json() as { data: { used_fallback: boolean } };
    expect(json.data.used_fallback).toBe(true);
  });

  it('returns 404 EXERCISE_NOT_FOUND for an unknown source exercise', async () => {
    const handler = createSwapOptionsHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'not_a_real_exercise',
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'EXERCISE_NOT_FOUND' },
    });
  });
});
