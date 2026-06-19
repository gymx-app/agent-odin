import { describe, expect, it } from 'vitest';
import { resolvePlannerVersion } from '../../src/application/programme-generation/planner-version.js';

describe('planner-version resolver', () => {
  it('defaults to the configured legacy planner', () => {
    expect(
      resolvePlannerVersion({
        defaultVersion: 'legacy_v1',
        longitudinalEnabled: false,
        allowedVersions: ['legacy_v1', 'longitudinal_v1'],
      }),
    ).toEqual({
      selected_version: 'legacy_v1',
      requested_version: null,
      fallback_applied: false,
      fallback_reason: null,
      reason_code: 'PLANNER_VERSION_DEFAULTED',
    });
  });

  it('uses an explicitly requested enabled planner', () => {
    expect(
      resolvePlannerVersion({
        requestedVersion: 'longitudinal_v1',
        defaultVersion: 'legacy_v1',
        longitudinalEnabled: true,
        allowedVersions: ['legacy_v1', 'longitudinal_v1'],
      }).selected_version,
    ).toBe('longitudinal_v1');
  });

  it('records fallback when a disabled longitudinal default is configured', () => {
    expect(
      resolvePlannerVersion({
        defaultVersion: 'longitudinal_v1',
        longitudinalEnabled: false,
        allowedVersions: ['legacy_v1', 'longitudinal_v1'],
      }),
    ).toMatchObject({
      selected_version: 'legacy_v1',
      fallback_applied: true,
      fallback_reason: 'PLANNER_VERSION_DISABLED',
    });
  });

  it('rejects a disabled explicitly requested planner', () => {
    expect(() =>
      resolvePlannerVersion({
        requestedVersion: 'longitudinal_v1',
        defaultVersion: 'legacy_v1',
        longitudinalEnabled: false,
        allowedVersions: ['legacy_v1', 'longitudinal_v1'],
      }),
    ).toThrow('Requested planner version is disabled.');
  });

  it('rejects a requested planner excluded by the allowed-version policy', () => {
    expect(() =>
      resolvePlannerVersion({
        requestedVersion: 'legacy_v1',
        defaultVersion: 'longitudinal_v1',
        longitudinalEnabled: true,
        allowedVersions: ['longitudinal_v1'],
      }),
    ).toThrow('Requested planner version is not supported.');
  });
});
