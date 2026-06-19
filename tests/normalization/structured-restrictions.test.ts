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

  it('normalizes an enriched movement restriction', () => {
    const profile = normalizeAthlete(
      createAthlete({
        movement_restrictions: [
          {
            region: 'shoulder',
            movement_demand: 'overhead_loading',
            tolerance: 'excluded',
            clinician_restriction: true,
          },
        ],
      }),
    );

    expect(profile.movement_restrictions).toContainEqual(
      expect.objectContaining({
        tag: 'overhead_loading',
        severity: 'avoid',
        source_fields: ['movement_restrictions'],
        clinician_restriction: true,
      }),
    );
  });

  it('merges legacy and enriched restrictions with the stricter rule winning', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'knee',
            severity: 'modify',
            notes: 'Modify impact.',
          },
        ],
        movement_restrictions: [
          {
            region: 'knee',
            movement_demand: 'high_impact',
            tolerance: 'excluded',
            notes: 'Clinician says avoid impact.',
            clinician_restriction: true,
          },
        ],
      }),
    );
    const restriction = profile.movement_restrictions.find(
      ({ tag }) => tag === 'high_impact',
    );

    expect(restriction).toMatchObject({
      severity: 'avoid',
      clinician_restriction: true,
    });
    expect(restriction?.source_fields?.sort()).toEqual([
      'injuries',
      'movement_restrictions',
    ]);
    expect(
      profile.movement_restrictions.filter(({ tag }) => tag === 'high_impact'),
    ).toHaveLength(1);
  });
});
