import { describe, expect, it, vi } from 'vitest';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import { successResponse } from '../../src/infrastructure/http/api-response.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { BadRequestError } from '../../src/shared/errors/http-errors.js';
import { createTestRequest, createTestResponse, header } from './test-http.js';

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
  aiAgentPlannerEnabled: false,
  openaiGenerationModel: null,
  openaiGenerationTimeoutMs: 45000,
  allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
};

const logger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe('endpoint handler', () => {
  it('maps AppError to the expected status and error body', async () => {
    const handler = createEndpointHandler({
      allowedMethods: ['GET'],
      config,
      logger,
      handle: () => {
        throw new BadRequestError({
          message: 'Invalid input.',
          details: {
            field: 'name',
          },
        });
      },
    });
    const response = createTestResponse();

    await handler(createTestRequest(), response);

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid input.',
        details: {
          field: 'name',
        },
      },
    });
  });

  it('converts unknown errors to HTTP 500 without stack traces or causes', async () => {
    const handler = createEndpointHandler({
      allowedMethods: ['GET'],
      config,
      logger,
      handle: () => {
        throw new Error('database exploded');
      },
    });
    const response = createTestResponse();

    await handler(createTestRequest(), response);

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
        details: null,
      },
    });
    expect(response.body).not.toContain('stack');
    expect(response.body).not.toContain('database exploded');
    expect(response.body).not.toContain('cause');
  });

  it('returns request IDs in error response headers', async () => {
    const handler = createEndpointHandler({
      allowedMethods: ['GET'],
      config,
      logger,
      handle: () => {
        throw new BadRequestError();
      },
    });
    const response = createTestResponse();

    await handler(
      createTestRequest({
        headers: {
          'x-request-id': 'req-test-123',
        },
      }),
      response,
    );

    expect(header(response.headers['x-request-id'])).toBe('req-test-123');
  });

  it('returns success responses from endpoint handlers', async () => {
    const handler = createEndpointHandler({
      allowedMethods: ['GET'],
      config,
      logger,
      handle: () => successResponse({ ok: true }),
    });
    const response = createTestResponse();

    await handler(createTestRequest(), response);

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      success: true,
      data: {
        ok: true,
      },
    });
  });
});
