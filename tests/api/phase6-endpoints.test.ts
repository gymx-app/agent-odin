import { describe, expect, it } from 'vitest';
import { createGenerateHandler } from '../../api/odin/generate.js';
import { createPreviewHandler } from '../../api/odin/preview.js';
import { createProfileHandler } from '../../api/profile.js';
import { createGetProgrammeHandler } from '../../api/programmes/[id].js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import type { SupabaseAuthClientLike } from '../../src/infrastructure/supabase/supabase.types.js';
import {
  beginnerFatLossAthlete,
  enrichedRecompositionAthlete,
} from '../../fixtures/athletes/valid-athletes.js';
import {
  createTestRequest,
  createTestResponse,
} from '../infrastructure/test-http.js';

const config: AppConfig = {
  nodeEnv: 'test',
  appVersion: '0.1.0',
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
  allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
};

const authClient = (userId: string | null): SupabaseAuthClientLike =>
  ({
    auth: {
      getUser: async () => ({
        data: {
          user: userId ? { id: userId } : null,
        },
        error: userId ? null : { message: 'invalid' },
      }),
    },
  }) as SupabaseAuthClientLike;

describe('public API boundaries', () => {
  it('requires authentication for programme preview', async () => {
    const response = createTestResponse();

    await createPreviewHandler(config, {
      authClient: authClient('user-1'),
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        body: {
          athlete: beginnerFatLossAthlete,
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: 'AUTHORIZATION_HEADER_MISSING',
        message: 'Authorization header is required.',
        details: null,
      },
    });
  });

  it('returns a validated stateless deterministic preview', async () => {
    const response = createTestResponse();

    await createPreviewHandler(config, {
      authClient: authClient('verified-user'),
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          athlete: beginnerFatLossAthlete,
          refinement_mode: 'deterministic',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        source: 'deterministic',
        planner_version: 'legacy_v1',
        schema_version: '1.0',
        programme: {
          programme: {
            goal_type: beginnerFatLossAthlete.goal,
          },
        },
        validation: {
          passed: true,
        },
        refinement: {
          requested: false,
          status: 'not_requested',
        },
      },
    });
    expect(response.json()).not.toHaveProperty('data.programme_id');
    expect(response.json()).not.toHaveProperty('data.version');
    expect(response.json()).not.toHaveProperty('data.status');
  });

  it('rejects invalid preview input before planning', async () => {
    const response = createTestResponse();

    await createPreviewHandler(config, {
      authClient: authClient('verified-user'),
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          athlete: {
            ...beginnerFatLossAthlete,
            available_days_per_week: 1,
          },
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: { code: 'BAD_REQUEST' },
    });
  });

  it('accepts enriched Athlete Input V2 through the existing preview endpoint', async () => {
    const response = createTestResponse();

    await createPreviewHandler(config, {
      authClient: authClient('verified-user'),
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          athlete: enrichedRecompositionAthlete,
          refinement_mode: 'deterministic',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        source: 'deterministic',
        validation: { passed: true },
      },
    });
  });

  it('returns a validated longitudinal preview when enabled and requested', async () => {
    const response = createTestResponse();
    await createPreviewHandler(
      {
        ...config,
        longitudinalPlannerEnabled: true,
      },
      { authClient: authClient('verified-user') },
    )(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        headers: { authorization: 'Bearer valid' },
        body: {
          athlete: beginnerFatLossAthlete,
          refinement_mode: 'deterministic',
          planner_version: 'longitudinal_v1',
          start_date: '2026-06-22',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      success: true,
      data: {
        planner_version: 'longitudinal_v1',
        schema_version: '2.0',
        source: 'deterministic',
        programme: {
          schema_version: '2.0',
          planner_version: 'longitudinal_v1',
        },
        validation: { passed: true },
      },
    });
  });

  it('rejects an unsupported planner version with a stable error', async () => {
    const response = createTestResponse();
    await createPreviewHandler(config, {
      authClient: authClient('verified-user'),
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/preview',
        headers: { authorization: 'Bearer valid' },
        body: {
          athlete: beginnerFatLossAthlete,
          planner_version: 'future_v9',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'PLANNER_VERSION_UNSUPPORTED',
      },
    });
  });

  it.each([
    ['PUT', '/api/profile', createProfileHandler(config)],
    ['POST', '/api/odin/generate', createGenerateHandler(config)],
    [
      'GET',
      '/api/programmes/11111111-1111-4111-8111-111111111111',
      createGetProgrammeHandler(config),
    ],
  ])('retires the persistent %s %s endpoint', async (method, url, handler) => {
    const response = createTestResponse();

    await handler(
      createTestRequest({
        method,
        url,
      }),
      response,
    );

    expect(response.statusCode).toBe(410);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'ENDPOINT_RETIRED',
      },
    });
  });
});
