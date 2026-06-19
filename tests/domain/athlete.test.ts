import { describe, expect, it } from 'vitest';
import { AthleteInputSchema } from '../../src/domain/athlete/athlete-input.schema.js';
import { NormalizedAthleteProfileSchema } from '../../src/domain/athlete/normalized-athlete-profile.schema.js';
import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import {
  beginnerFatLossAthlete,
  enrichedRecompositionAthlete,
  validAthleteFixtures,
} from '../../fixtures/athletes/valid-athletes.js';

describe('AthleteInputSchema', () => {
  it.each(validAthleteFixtures)(
    'accepts valid athlete fixture: %s',
    (fixture) => {
      expect(AthleteInputSchema.safeParse(fixture).success).toBe(true);
    },
  );

  it.each([
    ['age below minimum', { age: 15 }],
    ['unsupported training days', { available_days_per_week: 1 }],
    ['negative weight', { current_weight_kg: -1 }],
    [
      'malformed injury',
      { injuries: [{ area: '', severity: 'minor', notes: 'bad' }] },
    ],
  ])('rejects %s', (_name, patch) => {
    expect(
      AthleteInputSchema.safeParse({ ...beginnerFatLossAthlete, ...patch })
        .success,
    ).toBe(false);
  });

  it('supports inferred AthleteInput type', () => {
    const athlete: AthleteInput = beginnerFatLossAthlete;
    expect(athlete.goal).toBe('fat_loss');
  });

  it('accepts the enriched Athlete Input V2 fixture', () => {
    expect(
      AthleteInputSchema.safeParse(enrichedRecompositionAthlete).success,
    ).toBe(true);
  });

  it.each([
    [
      'available and unavailable overlap',
      {
        schedule: {
          available_days: ['MON', 'TUE', 'WED'],
          unavailable_days: ['WED'],
        },
      },
      ['schedule', 'available_days'],
      'SCHEDULE_DAY_AVAILABLE_AND_UNAVAILABLE',
    ],
    [
      'preferred outside available',
      {
        schedule: {
          available_days: ['MON', 'TUE', 'WED'],
          preferred_days: ['THU'],
        },
      },
      ['schedule', 'preferred_days'],
      'SCHEDULE_PREFERRED_DAY_NOT_AVAILABLE',
    ],
    [
      'explicit count conflicts with legacy count',
      {
        schedule: {
          available_days: ['MON', 'TUE'],
        },
      },
      ['schedule', 'available_days'],
      'SCHEDULE_AVAILABLE_DAY_COUNT_MISMATCH',
    ],
    [
      'duplicate available days',
      {
        schedule: {
          available_days: ['MON', 'MON', 'WED'],
        },
      },
      ['schedule', 'available_days'],
      'DUPLICATE_VALUES_NOT_ALLOWED',
    ],
  ])('rejects schedule contradiction: %s', (_name, patch, path, message) => {
    const result = AthleteInputSchema.safeParse({
      ...beginnerFatLossAthlete,
      ...patch,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({ path, message }),
      );
    }
  });
});

describe('NormalizedAthleteProfileSchema', () => {
  it('accepts valid normalized profile placeholders', () => {
    const profile = normalizeAthlete(beginnerFatLossAthlete);
    expect(NormalizedAthleteProfileSchema.safeParse(profile).success).toBe(
      true,
    );
  });
});
