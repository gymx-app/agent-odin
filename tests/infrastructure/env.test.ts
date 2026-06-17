import { describe, expect, it } from 'vitest';
import { parseEnv } from '../../src/infrastructure/config/env.schema.js';

describe('environment configuration', () => {
  it('uses valid defaults', () => {
    expect(parseEnv({})).toEqual({
      nodeEnv: 'development',
      appVersion: '0.1.0',
      allowedOrigins: [],
      logLevel: 'info',
    });
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
        ALLOWED_ORIGINS:
          'https://app.example.com, http://localhost:5173, ,https://admin.example.com',
      }).allowedOrigins,
    ).toEqual([
      'https://app.example.com',
      'http://localhost:5173',
      'https://admin.example.com',
    ]);
  });
});
