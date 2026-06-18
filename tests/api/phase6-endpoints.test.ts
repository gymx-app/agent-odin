import { describe, expect, it } from 'vitest';
import { createGenerateHandler } from '../../api/odin/generate.js';
import { createProfileHandler } from '../../api/profile.js';
import { createGetProgrammeHandler } from '../../api/programmes/[id].js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import type {
  SupabaseAuthClientLike,
  SupabaseClientLike,
} from '../../src/infrastructure/supabase/supabase.types.js';
import {
  createTestRequest,
  createTestResponse,
} from '../infrastructure/test-http.js';
import { createQueryClient } from '../repositories/test-supabase-client.js';

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

const unusedAdminClient = {
  from: () => {
    throw new Error('Admin client should not be used.');
  },
} as SupabaseClientLike;

describe('Phase 6 API endpoints', () => {
  it('returns the stable missing-authorization error from generate', async () => {
    const response = createTestResponse();

    await createGenerateHandler(config, {
      authClient: authClient('user-1'),
      adminClient: unusedAdminClient,
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/generate',
        body: {},
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

  it('rejects an invalid refinement mode before generation', async () => {
    const response = createTestResponse();

    await createGenerateHandler(config, {
      authClient: authClient('user-1'),
      adminClient: unusedAdminClient,
    })(
      createTestRequest({
        method: 'POST',
        url: '/api/odin/generate',
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          refinement_mode: 'unrestricted',
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

  it('rejects body-supplied user IDs on the profile endpoint', async () => {
    const response = createTestResponse();

    await createProfileHandler(config, {
      authClient: authClient('verified-user'),
      adminClient: unusedAdminClient,
    })(
      createTestRequest({
        method: 'PUT',
        url: '/api/profile',
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          user_id: 'other-user',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      success: false,
      error: {
        code: 'BAD_REQUEST',
      },
    });
  });

  it('returns not found without revealing ownership for programme retrieval', async () => {
    const response = createTestResponse();
    const { client } = createQueryClient({
      single: { data: null, error: null },
    });

    await createGetProgrammeHandler(config, {
      authClient: authClient('verified-user'),
      adminClient: client,
    })(
      createTestRequest({
        method: 'GET',
        url: '/api/programmes/another-users-programme',
        headers: {
          authorization: 'Bearer valid',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: 'PROGRAMME_NOT_FOUND',
        message: 'Programme was not found.',
        details: null,
      },
    });
  });
});
