import { describe, expect, it } from 'vitest';
import { AthleteInputSchema } from '../../src/domain/athlete/athlete-input.schema.js';
import { NormalizedAthleteProfileSchema } from '../../src/domain/athlete/normalized-athlete-profile.schema.js';
import type {
  AthleteInput,
  NormalizedAthleteProfile,
} from '../../src/domain/athlete/athlete.types.js';
import {
  beginnerFatLossAthlete,
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
});

describe('NormalizedAthleteProfileSchema', () => {
  it('accepts valid normalized profile placeholders', () => {
    const profile: NormalizedAthleteProfile = {
      source: beginnerFatLossAthlete,
      training_age_category: 'beginner',
      weekly_training_minutes: 135,
      programme_horizon_weeks: 8,
      recovery_capacity: 'unknown',
      restricted_movement_tags: [],
      excluded_exercise_ids: [],
      health_flags: [
        {
          code: 'NO_INBODY',
          severity: 'info',
          message: 'No InBody data supplied.',
        },
      ],
      assumptions: ['No normalization logic is implemented in Phase 0.'],
      programme_confidence: 'medium',
    };
    expect(NormalizedAthleteProfileSchema.safeParse(profile).success).toBe(
      true,
    );
  });
});
