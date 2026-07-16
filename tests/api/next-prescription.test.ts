import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createTestRequest, createTestResponse } from '../infrastructure/test-http.js';
import { createV2Athlete } from './test-athlete-v2.js';
import { createNextPrescriptionHandler } from '../../api/odin/next-prescription.js';

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

describe('POST /api/odin/next-prescription', () => {
  it('progresses target reps when all sets are completed at or below the RPE ceiling', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        current_target_reps: 8,
        progression_bounds: { rep_min: 6, rep_max: 10 },
        completed_sets: [
          { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 7 },
          { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 8 },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        exercise_id: 'dumbbell_biceps_curl',
        next_target_reps: 9,
        increase_load: false,
      },
    });
  });

  it('holds the prescription when a set misses target reps', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        current_target_reps: 8,
        progression_bounds: { rep_min: 6, rep_max: 10 },
        completed_sets: [
          { target_reps: 8, rpe_ceiling: 8, reps_achieved: 6, rpe_reported: 9 },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.json()).toMatchObject({
      success: true,
      data: { next_target_reps: 8, increase_load: false },
    });
  });

  it('increases load and resets reps at the top of the progression range', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        current_target_reps: 10,
        progression_bounds: { rep_min: 6, rep_max: 10 },
        completed_sets: [
          { target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.json()).toMatchObject({
      success: true,
      data: { next_target_reps: 6, increase_load: true },
    });
  });

  it('computes next_target_weight_kg when current_weight_kg is echoed back', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'barbell_back_squat',
        current_target_reps: 10,
        progression_bounds: {
          rep_min: 6,
          rep_max: 10,
          current_weight_kg: 100,
        },
        completed_sets: [
          { target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.json()).toMatchObject({
      success: true,
      data: {
        next_target_reps: 6,
        increase_load: true,
        next_target_weight_kg: 102.5,
      },
    });
  });

  it('rejects an invalid progression_bounds range', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        exercise_id: 'dumbbell_biceps_curl',
        current_target_reps: 8,
        progression_bounds: { rep_min: 10, rep_max: 6 },
        completed_sets: [
          { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 7 },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(400);
  });

  it('requires authentication', async () => {
    const handler = createNextPrescriptionHandler(config);
    const response = createTestResponse();

    await handler(
      createTestRequest({
        method: 'POST',
        body: {
          exercise_id: 'dumbbell_biceps_curl',
          current_target_reps: 8,
          progression_bounds: { rep_min: 6, rep_max: 10 },
          completed_sets: [
            { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 7 },
          ],
          athlete: createV2Athlete(),
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(401);
  });
});
