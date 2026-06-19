import { describe, expect, it } from 'vitest';
import {
  createApiDependencies,
  getRuntimeDependencies,
} from '../../src/api/dependencies.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';

const config: AppConfig = {
  nodeEnv: 'test',
  appVersion: '0.1.0',
  allowedOrigins: [],
  logLevel: 'error',
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'anon',
  supabaseServiceRoleKey: 'service-role',
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

describe('runtime dependencies', () => {
  it('reuses safe clients across warm calls without creating OpenAI', () => {
    const first = getRuntimeDependencies(config);
    const second = getRuntimeDependencies(config);

    expect(second).toBe(first);
    expect(first.refinementProvider).toBeUndefined();
  });

  it('keeps the uncached dependency factory available for injection', () => {
    expect(createApiDependencies(config)).not.toBe(
      createApiDependencies(config),
    );
  });
});
