import { describe, expect, it } from 'vitest';
import { mapInjuriesToRestrictions } from '../../src/normalization/injury-restrictions.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from './test-athletes.js';

describe('structured movement restrictions', () => {
  it('preserves modify severity', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'modify',
        notes: 'Modify deep loaded flexion.',
      },
    ]);

    expect(result.movementRestrictions).toContainEqual(
      expect.objectContaining({
        tag: 'loaded_deep_knee_flexion',
        severity: 'modify',
      }),
    );
  });

  it('preserves avoid severity', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'avoid',
        notes: 'Avoid jumping.',
      },
    ]);

    expect(result.movementRestrictions).toContainEqual(
      expect.objectContaining({
        tag: 'high_impact',
        severity: 'avoid',
      }),
    );
  });

  it('lets avoid win when duplicate tag severities conflict', () => {
    const result = mapInjuriesToRestrictions([
      {
        area: 'knee',
        severity: 'modify',
        notes: 'Modify impact.',
      },
      {
        area: 'ankle',
        severity: 'avoid',
        notes: 'Avoid impact.',
      },
    ]);

    expect(
      result.movementRestrictions.find(
        (restriction) => restriction.tag === 'high_impact',
      )?.severity,
    ).toBe('avoid');
  });

  it('keeps flat compatibility tags synchronized', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'knee',
            severity: 'avoid',
            notes: 'Avoid jumping.',
          },
        ],
      }),
    );

    expect(profile.restricted_movement_tags.sort()).toEqual(
      profile.movement_restrictions
        .map((restriction) => restriction.tag)
        .sort(),
    );
  });
});
