import { describe, expect, it } from 'vitest';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createSupabaseAdminClient } from '../../src/infrastructure/supabase/admin-client.js';
import { createSupabaseAuthClient } from '../../src/infrastructure/supabase/auth-client.js';

const config: AppConfig = {
  nodeEnv: 'test',
  appVersion: '0.1.0',
  allowedOrigins: [],
  logLevel: 'error',
  supabaseUrl: null,
  supabaseAnonKey: null,
  supabaseServiceRoleKey: null,
  openaiApiKey: null,
  openaiModel: null,
  openaiStrategyModel: 'gpt-4o-mini',
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
};

describe('Supabase client factories', () => {
  it('validates missing auth configuration when the auth client is needed', () => {
    expect(() => createSupabaseAuthClient(config)).toThrow(
      'Supabase authentication configuration is missing.',
    );
  });

  it('validates missing service-role configuration when the admin client is needed', () => {
    expect(() => createSupabaseAdminClient(config)).toThrow(
      'Supabase admin configuration is missing.',
    );
  });
});
