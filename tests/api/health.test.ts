import { describe, expect, it } from 'vitest';
import { createHealthHandler } from '../../api/health.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import {
  createTestRequest,
  createTestResponse,
  header,
} from '../infrastructure/test-http.js';

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
  allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
};

describe('GET /api/health', () => {
  it('returns a shared success response with service health data', async () => {
    const response = createTestResponse();

    await createHealthHandler(config)(createTestRequest(), response);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: {
        service: 'agent-odin',
        version: '9.8.7',
        status: 'ok',
        default_planner_version: 'legacy_v1',
        longitudinal_planner_enabled: false,
        ai_agent_enabled: false,
        openai_connected: false,
        supported_planner_versions: ['legacy_v1', 'longitudinal_v1'],
      },
    });
  });

  it('returns a generated request ID', async () => {
    const response = createTestResponse();

    await createHealthHandler(config)(createTestRequest(), response);

    expect(header(response.headers['x-request-id'])).toEqual(
      expect.any(String),
    );
  });

  it('reuses a supplied x-request-id', async () => {
    const response = createTestResponse();

    await createHealthHandler(config)(
      createTestRequest({
        headers: {
          'x-request-id': 'req-existing',
        },
      }),
      response,
    );

    expect(header(response.headers['x-request-id'])).toBe('req-existing');
  });

  it('returns 405 and an Allow header for unsupported methods', async () => {
    const response = createTestResponse();

    await createHealthHandler(config)(
      createTestRequest({
        method: 'POST',
      }),
      response,
    );

    expect(response.statusCode).toBe(405);
    expect(header(response.headers.allow)).toBe('GET, OPTIONS');
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method POST is not allowed.',
        details: {
          allow: 'GET, OPTIONS',
        },
      },
    });
  });

  it('handles OPTIONS preflight requests', async () => {
    const response = createTestResponse();

    await createHealthHandler(config)(
      createTestRequest({
        method: 'OPTIONS',
        headers: {
          origin: 'https://app.example.com',
        },
      }),
      response,
    );

    expect(response.statusCode).toBe(204);
    expect(response.body).toBeUndefined();
    expect(header(response.headers.allow)).toBe('GET, OPTIONS');
    expect(header(response.headers['access-control-allow-origin'])).toBe(
      'https://app.example.com',
    );
    expect(header(response.headers['access-control-allow-methods'])).toBe(
      'GET, POST, PUT, OPTIONS',
    );
    expect(header(response.headers['access-control-allow-headers'])).toBe(
      'Content-Type, Authorization, Idempotency-Key, X-Request-Id',
    );
  });
});
