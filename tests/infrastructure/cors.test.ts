import { describe, expect, it } from 'vitest';
import { applyCorsHeaders } from '../../src/infrastructure/http/cors.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createTestRequest, createTestResponse, header } from './test-http.js';

const createConfig = (overrides: Partial<AppConfig> = {}): AppConfig => ({
  nodeEnv: 'production',
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
  aiAgentPlannerEnabled: false,
  openaiGenerationModel: null,
  openaiGenerationTimeoutMs: 45000,
  aiGenerationProvider: 'openai' as const,
  anthropicApiKey: null,
  anthropicModel: null,
  anthropicTimeoutMs: 45000,
  allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
  ...overrides,
});

describe('CORS helper', () => {
  it('accepts an explicitly allowed origin', () => {
    const response = createTestResponse();
    const result = applyCorsHeaders(
      response,
      createTestRequest({
        headers: {
          origin: 'https://app.example.com',
        },
      }),
      createConfig(),
    );

    expect(result.allowed).toBe(true);
    expect(header(response.headers['access-control-allow-origin'])).toBe(
      'https://app.example.com',
    );
  });

  it('omits allow-origin for a disallowed origin', () => {
    const response = createTestResponse();
    const result = applyCorsHeaders(
      response,
      createTestRequest({
        headers: {
          origin: 'https://evil.example.com',
        },
      }),
      createConfig(),
    );

    expect(result.allowed).toBe(false);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('accepts localhost origins during development', () => {
    const response = createTestResponse();
    const result = applyCorsHeaders(
      response,
      createTestRequest({
        headers: {
          origin: 'http://localhost:5173',
        },
      }),
      createConfig({
        nodeEnv: 'development',
        allowedOrigins: [],
      }),
    );

    expect(result.allowed).toBe(true);
    expect(header(response.headers['access-control-allow-origin'])).toBe(
      'http://localhost:5173',
    );
  });

  it('sets preflight headers for allowed origins', () => {
    const response = createTestResponse();

    applyCorsHeaders(
      response,
      createTestRequest({ headers: { origin: 'https://app.example.com' } }),
      createConfig(),
    );

    expect(header(response.headers['access-control-allow-methods'])).toBe(
      'GET, POST, PUT, OPTIONS',
    );
    expect(header(response.headers['access-control-allow-headers'])).toBe(
      'Content-Type, Authorization, Idempotency-Key, X-Request-Id',
    );
    expect(header(response.headers['access-control-max-age'])).toBe('86400');
  });

  it('omits preflight headers when no origin is sent', () => {
    const response = createTestResponse();

    applyCorsHeaders(response, createTestRequest(), createConfig());

    expect(response.headers['access-control-allow-methods']).toBeUndefined();
    expect(response.headers['access-control-allow-headers']).toBeUndefined();
  });
});
