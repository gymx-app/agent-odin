import { describe, expect, it } from 'vitest';
import { parseEnv } from '../../src/infrastructure/config/env.schema.js';

describe('environment configuration', () => {
  it('allows Supabase credentials to be omitted in test mode', () => {
    expect(parseEnv({ NODE_ENV: 'test' })).toEqual({
      nodeEnv: 'test',
      appVersion: '0.1.0',
      allowedOrigins: [],
      logLevel: 'info',
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
      aiAgentPlannerEnabled: true,
      openaiGenerationModel: null,
      openaiGenerationTimeoutMs: 45000,
      aiGenerationProvider: 'openai',
      anthropicApiKey: null,
      anthropicModel: null,
      anthropicTimeoutMs: 45000,
      allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1', 'ai_agent_v1'],
      rateLimitStrategyPerDay: 10,
    });
  });

  it('allows unauthenticated endpoints to load without Supabase credentials', () => {
    expect(parseEnv({ NODE_ENV: 'production' })).toEqual(
      expect.objectContaining({
        supabaseUrl: null,
        supabaseAnonKey: null,
        supabaseServiceRoleKey: null,
      }),
    );
  });

  it('loads Supabase credentials without exposing them through unrelated fields', () => {
    expect(
      parseEnv({
        NODE_ENV: 'production',
        SUPABASE_URL: 'https://example.supabase.co',
        SUPABASE_ANON_KEY: 'anon',
        SUPABASE_SERVICE_ROLE_KEY: 'service',
      }),
    ).toEqual(
      expect.objectContaining({
        supabaseUrl: 'https://example.supabase.co',
        supabaseAnonKey: 'anon',
        supabaseServiceRoleKey: 'service',
      }),
    );
  });

  it('rejects invalid NODE_ENV values', () => {
    expect(() => parseEnv({ NODE_ENV: 'staging' })).toThrow(
      'Invalid environment configuration',
    );
  });

  it('rejects invalid LOG_LEVEL values', () => {
    expect(() => parseEnv({ LOG_LEVEL: 'trace' })).toThrow(
      'Invalid environment configuration',
    );
  });

  it('normalizes comma-separated origins', () => {
    expect(
      parseEnv({
        NODE_ENV: 'test',
        ALLOWED_ORIGINS:
          'https://app.example.com, http://localhost:5173, ,https://admin.example.com',
      }).allowedOrigins,
    ).toEqual([
      'https://app.example.com',
      'http://localhost:5173',
      'https://admin.example.com',
    ]);
  });

  it('requires OpenAI credentials only when refinement is enabled', () => {
    expect(() =>
      parseEnv({
        NODE_ENV: 'test',
        ODIN_LLM_REFINEMENT_ENABLED: 'true',
      }),
    ).toThrow('Invalid environment configuration');

    expect(
      parseEnv({
        NODE_ENV: 'test',
        ODIN_LLM_REFINEMENT_ENABLED: 'true',
        OPENAI_API_KEY: 'test-key',
        OPENAI_MODEL: 'configured-model',
      }),
    ).toEqual(
      expect.objectContaining({
        llmRefinementEnabled: true,
        generationTimeoutMs: 60000,
        openaiModel: 'configured-model',
        openaiGenerationModel: 'configured-model',
        openaiTimeoutMs: 20000,
        openaiMaxRetries: 1,
      }),
    );
  });

  it('treats blank optional OpenAI values as absent when disabled', () => {
    expect(
      parseEnv({
        NODE_ENV: 'test',
        OPENAI_API_KEY: '',
        OPENAI_MODEL: '',
      }),
    ).toEqual(
      expect.objectContaining({
        openaiApiKey: null,
        openaiModel: null,
        llmRefinementEnabled: false,
        generationTimeoutMs: 60000,
      }),
    );
  });

  it('validates timeout and retry bounds', () => {
    expect(() =>
      parseEnv({ NODE_ENV: 'test', OPENAI_TIMEOUT_MS: '500' }),
    ).toThrow('Invalid environment configuration');
    expect(() =>
      parseEnv({ NODE_ENV: 'test', OPENAI_MAX_RETRIES: '2' }),
    ).toThrow('Invalid environment configuration');
  });

  it('loads and validates planner rollout configuration', () => {
    expect(
      parseEnv({
        NODE_ENV: 'test',
        ODIN_DEFAULT_PLANNER_VERSION: 'longitudinal_v1',
        ODIN_LONGITUDINAL_PLANNER_ENABLED: 'true',
        ODIN_ALLOWED_PLANNER_VERSIONS: 'legacy_v1,longitudinal_v1',
      }),
    ).toMatchObject({
      defaultPlannerVersion: 'longitudinal_v1',
      longitudinalPlannerEnabled: true,
      aiAgentPlannerEnabled: true,
      openaiGenerationModel: null,
      openaiGenerationTimeoutMs: 45000,
      allowedPlannerVersions: ['legacy_v1', 'longitudinal_v1'],
    });
    expect(() =>
      parseEnv({
        NODE_ENV: 'test',
        ODIN_DEFAULT_PLANNER_VERSION: 'longitudinal_v1',
        ODIN_ALLOWED_PLANNER_VERSIONS: 'legacy_v1',
      }),
    ).toThrow('Default planner version must be allowed.');
  });

  it('falls back openaiGenerationModel to OPENAI_MODEL when OPENAI_GENERATION_MODEL is unset', () => {
    expect(
      parseEnv({
        NODE_ENV: 'test',
        OPENAI_MODEL: 'gpt-4o-mini',
      }),
    ).toMatchObject({
      openaiModel: 'gpt-4o-mini',
      openaiGenerationModel: 'gpt-4o-mini',
    });

    expect(
      parseEnv({
        NODE_ENV: 'test',
        OPENAI_MODEL: 'gpt-4o-mini',
        OPENAI_GENERATION_MODEL: 'gpt-4o',
      }),
    ).toMatchObject({
      openaiModel: 'gpt-4o-mini',
      openaiGenerationModel: 'gpt-4o',
    });
  });
});
