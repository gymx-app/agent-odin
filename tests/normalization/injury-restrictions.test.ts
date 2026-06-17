import { describe, expect, it } from 'vitest';
import { mapInjuriesToRestrictions } from '../../src/normalization/injury-restrictions.js';

describe('mapInjuriesToRestrictions', () => {
  it('maps knee modify restrictions', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'modify',
        notes: 'Sensitive with deep flexion.',
      },
    ]);

    expect(result.restrictedMovementTags).toEqual([
      'loaded_deep_knee_flexion',
      'high_impact',
      'single_leg_loading',
    ]);
  });

  it('adds stronger knee avoid restrictions', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'avoid',
        notes: 'No jumping.',
      },
    ]);

    expect(result.restrictedMovementTags).toContain('high_impact');
    expect(result.movementRestrictions).toContainEqual(
      expect.objectContaining({
        tag: 'high_impact',
        severity: 'avoid',
      }),
    );
    expect(result.healthFlags).toEqual([
      {
        code: 'AVOID_SEVERITY_INJURY',
        severity: 'warning',
        message:
          'Injury area "knee" is marked avoid and should constrain exercise selection.',
      },
    ]);
  });

  it('maps lower-back restrictions', () => {
    expect(
      mapInjuriesToRestrictions([
        {
          area: 'lower back',
          severity: 'modify',
          notes: 'Avoid loaded rounding.',
        },
      ]).restrictedMovementTags,
    ).toContain('loaded_spinal_flexion');
  });

  it('maps wrist restrictions', () => {
    expect(
      mapInjuriesToRestrictions([
        {
          area: 'wrist',
          severity: 'modify',
          notes: 'Extension bothers it.',
        },
      ]).restrictedMovementTags,
    ).toContain('high_wrist_extension');
  });

  it('removes duplicate tags', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'modify',
        notes: 'No jumping.',
      },
      {
        area: 'ankle',
        severity: 'modify',
        notes: 'No jumping.',
      },
    ]);

    expect(
      result.restrictedMovementTags.filter((tag) => tag === 'high_impact'),
    ).toHaveLength(1);
  });

  it('creates a flag for unknown injury areas', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'rib',
        severity: 'modify',
        notes: 'Unclear restriction.',
      },
    ]);

    expect(result.healthFlags[0]?.code).toBe('UNKNOWN_INJURY_AREA');
    expect(result.assumptions[0]).toContain('manual movement restriction');
  });

  it('handles multiple injuries', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'shoulder',
        severity: 'modify',
        notes: 'Overhead pain.',
      },
      {
        area: 'elbow',
        severity: 'avoid',
        notes: 'Avoid heavy curls.',
      },
    ]);

    expect(result.restrictedMovementTags).toContain('overhead_loading');
    expect(result.restrictedMovementTags).toContain('high_elbow_flexion_load');
    expect(result.healthFlags[0]?.code).toBe('AVOID_SEVERITY_INJURY');
  });
});
