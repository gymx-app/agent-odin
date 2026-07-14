import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createTestRequest, createTestResponse } from '../infrastructure/test-http.js';
import { createV2Athlete } from './test-athlete-v2.js';
import { createReadinessCheckHandler } from '../../api/odin/readiness-check.js';

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

const goodSet = { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 7 };
const missedSet = { target_reps: 8, rpe_ceiling: 8, reps_achieved: 6, rpe_reported: 8 };

describe('POST /api/odin/readiness-check', () => {
  it('does not recommend a deload for solid recent sessions', async () => {
    const handler = createReadinessCheckHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        recent_sessions: [
          { completed_sets: [goodSet] },
          { completed_sets: [goodSet] },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: { deload_recommended: false, triggered_reasons: [] },
    });
  });

  it('recommends a deload with adjustment factors after repeated missed sessions', async () => {
    const handler = createReadinessCheckHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({
        recent_sessions: [
          { completed_sets: [missedSet] },
          { completed_sets: [missedSet] },
        ],
        athlete: createV2Athlete(),
      }),
      response,
    );

    const json = response.json() as {
      data: {
        deload_recommended: boolean;
        triggered_reasons: string[];
        deload_adjustments: { volume_factor?: number };
      };
    };
    expect(json.data.deload_recommended).toBe(true);
    expect(json.data.triggered_reasons.length).toBeGreaterThan(0);
    expect(json.data.deload_adjustments.volume_factor).toBe(0.7);
  });

  it('rejects an empty recent_sessions array', async () => {
    const handler = createReadinessCheckHandler(config);
    const response = createTestResponse();

    await handler(
      postRequest({ recent_sessions: [], athlete: createV2Athlete() }),
      response,
    );

    expect(response.statusCode).toBe(400);
  });

  it('requires authentication', async () => {
    const handler = createReadinessCheckHandler(config);
    const response = createTestResponse();

    await handler(
      createTestRequest({
        method: 'POST',
        body: {
          recent_sessions: [{ completed_sets: [goodSet] }],
          athlete: createV2Athlete(),
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(401);
  });
});
