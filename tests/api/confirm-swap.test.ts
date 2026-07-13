import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createTestRequest, createTestResponse } from '../infrastructure/test-http.js';
import { createV2Athlete } from './test-athlete-v2.js';
import { createConfirmSwapHandler } from '../../api/odin/confirm-swap.js';
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

describe('POST /api/odin/confirm-swap', () => {
  it('confirms a swap between exercises in the same substitution group', async () => {
    const handler = createConfirmSwapHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        chosen_alternative_id: 'band_biceps_curl',
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        valid: true,
        exercise_id: 'dumbbell_biceps_curl',
        chosen_alternative: { exercise_id: 'band_biceps_curl' },
      },
    });
  });

  it('keeps the replaced exercise revertible in the returned substitution_options', async () => {
    const handler = createConfirmSwapHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        chosen_alternative_id: 'band_biceps_curl',
        athlete: createV2Athlete(),
      }),
      response,
    );

    const json = response.json() as {
      data: { substitution_options: { approved_exercise_ids: string[] } };
    };

    // The exercise just swapped away from must stay selectable so the user
    // can revert the swap, even though it wasn't a top-ranked match for
    // the newly-chosen exercise.
    expect(json.data.substitution_options.approved_exercise_ids).toContain(
      'dumbbell_biceps_curl',
    );
  });

  it('drops the replaced exercise from substitution_options once it becomes ineligible', async () => {
    const handler = createConfirmSwapHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'barbell_biceps_curl',
        chosen_alternative_id: 'dumbbell_hammer_curl',
        athlete: createV2Athlete({
          injuries: [{ area: 'wrist', modification: 'avoid', notes: 'TFCC tear.' }],
        }),
      }),
      response,
    );

    const json = response.json() as {
      data: { substitution_options: { approved_exercise_ids: string[] } };
    };

    expect(json.data.substitution_options.approved_exercise_ids).not.toContain(
      'barbell_biceps_curl',
    );
  });

  it('rejects an unknown chosen_alternative_id with SUBSTITUTION_GROUP_INVALID', async () => {
    const handler = createConfirmSwapHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        chosen_alternative_id: 'not_a_real_exercise',
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'SUBSTITUTION_GROUP_INVALID' },
    });
  });

  // The core case the ticket asked for: a swap that getSwapOptions would
  // never have offered (the candidate is excluded by an injury) must still
  // be caught here, even if the frontend only ever renders vetted options.
  it('rejects a swap to an exercise excluded by the athlete profile, and confirms getSwapOptions would never have offered it', async () => {
    const athleteWithKneeInjury = createV2Athlete({
      injuries: [{ area: 'knee', modification: 'avoid', notes: 'Post-surgery.' }],
    });

    const optionsHandler = createSwapOptionsHandler(config);
    const optionsResponse = createTestResponse();
    await optionsHandler(
      postRequest({
        exercise_id: 'dumbbell_goblet_squat',
        substitution_options: { approved_exercise_ids: [] },
        athlete: athleteWithKneeInjury,
      }),
      optionsResponse,
    );
    const offeredIds = (
      optionsResponse.json() as { data: { options: { exercise_id: string }[] } }
    ).data.options.map((option) => option.exercise_id);
    expect(offeredIds).not.toContain('barbell_back_squat');

    const confirmHandler = createConfirmSwapHandler(config);
    const confirmResponse = createTestResponse();
    await confirmHandler(
      postRequest({
        exercise_id: 'dumbbell_goblet_squat',
        chosen_alternative_id: 'barbell_back_squat',
        athlete: athleteWithKneeInjury,
      }),
      confirmResponse,
    );

    expect(confirmResponse.statusCode).toBe(422);
    expect(confirmResponse.json()).toMatchObject({
      success: false,
      error: { code: 'SUBSTITUTE_EXERCISE_EXCLUDED' },
    });
  });

  it('requires authentication', async () => {
    const handler = createConfirmSwapHandler(config);
    const response = createTestResponse();

    await handler(
      createTestRequest({
        method: 'POST',
        body: {
          exercise_id: 'dumbbell_biceps_curl',
          chosen_alternative_id: 'band_biceps_curl',
          athlete: createV2Athlete(),
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(401);
  });
});
