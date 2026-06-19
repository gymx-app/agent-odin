import { describe, expect, it } from 'vitest';
import { NormalizedAthleteProfileSchema } from '../../src/domain/athlete/normalized-athlete-profile.schema.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import {
  beginnerFatLossAthlete,
  enrichedRecompositionAthlete,
  validAthleteFixtures,
} from '../../fixtures/athletes/valid-athletes.js';
import { selectProgrammeStrategy } from '../../src/planning/strategy-selector.js';
import { completeInBody, createAthlete } from './test-athletes.js';

describe('normalizeAthlete', () => {
  it.each(validAthleteFixtures)(
    'normalizes a valid athlete fixture into the existing schema',
    (fixture) => {
      const profile = normalizeAthlete(fixture);

      expect(NormalizedAthleteProfileSchema.safeParse(profile).success).toBe(
        true,
      );
    },
  );

  it('preserves the source input and maps fitness level directly', () => {
    const profile = normalizeAthlete(beginnerFatLossAthlete);

    expect(profile.source).toStrictEqual(beginnerFatLossAthlete);
    expect(profile.training_age_category).toBe('beginner');
  });

  it('returns empty excluded exercise IDs in Phase 2', () => {
    expect(
      normalizeAthlete(beginnerFatLossAthlete).excluded_exercise_ids,
    ).toEqual([]);
  });

  it('handles no injuries', () => {
    expect(
      normalizeAthlete(
        createAthlete({
          injuries: [],
        }),
      ).restricted_movement_tags,
    ).toEqual([]);
  });

  it('handles unknown injury areas through flags and assumptions', () => {
    const profile = normalizeAthlete(
      createAthlete({
        injuries: [
          {
            area: 'rib',
            severity: 'modify',
            notes: 'Unclear.',
          },
        ],
      }),
    );

    expect(profile.health_flags).toContainEqual(
      expect.objectContaining({
        code: 'UNKNOWN_INJURY_AREA',
      }),
    );
    expect(
      profile.assumptions.some((assumption) => assumption.includes('rib')),
    ).toBe(true);
  });

  it('handles null InBody with visible assumptions', () => {
    expect(normalizeAthlete(beginnerFatLossAthlete).assumptions).toContain(
      'InBody data was not provided.',
    );
  });

  it('handles maximum supported days and session duration', () => {
    expect(
      normalizeAthlete(
        createAthlete({
          available_days_per_week: 7,
          session_duration_min: 180,
        }),
      ).weekly_training_minutes,
    ).toBe(1260);
  });

  it('handles minimum supported days and session duration', () => {
    const profile = normalizeAthlete(
      createAthlete({
        available_days_per_week: 2,
        session_duration_min: 20,
      }),
    );

    expect(profile.weekly_training_minutes).toBe(40);
    expect(profile.health_flags).toContainEqual(
      expect.objectContaining({
        code: 'LOW_TRAINING_AVAILABILITY',
      }),
    );
  });

  it('handles visceral fat above 100', () => {
    expect(
      normalizeAthlete(
        createAthlete({
          inbody: {
            ...completeInBody,
            visceral_fat_area: 110,
          },
        }),
      ).health_flags,
    ).toContainEqual(
      expect.objectContaining({
        code: 'ELEVATED_VISCERAL_FAT',
      }),
    );
  });

  it('normalizes a complete enriched profile into structured athlete state', () => {
    const profile = normalizeAthlete(enrichedRecompositionAthlete);

    expect(profile.athlete_state).toMatchObject({
      training_status: { value: 'intermediate', confidence: 'high' },
      schedule_capacity: { value: 'standard', confidence: 'high' },
      recovery_capacity: { value: 'high' },
      energy_availability: { value: 'maintenance', confidence: 'high' },
      protein_adequacy: { value: 'likely_adequate' },
      sport_interference_risk: { value: 'moderate' },
    });
    expect(profile.equipment_capabilities.source).toBe('explicit');
    expect(profile.planning_assumptions).toEqual([]);
    expect(profile.missing_inputs).toEqual([]);
  });

  it('keeps origin metadata neutral to state and strategy-facing values', () => {
    const first = normalizeAthlete(
      createAthlete({
        origin_metadata: {
          country: 'India',
          ethnicity: 'South Asian',
        },
      }),
    );
    const second = normalizeAthlete(
      createAthlete({
        origin_metadata: {
          country: 'Brazil',
          ethnicity: 'Latino',
        },
      }),
    );

    expect(first.athlete_state).toStrictEqual(second.athlete_state);
    expect(first.recovery_capacity).toBe(second.recovery_capacity);
    expect(first.training_age_category).toBe(second.training_age_category);
    expect(selectProgrammeStrategy(first)).toStrictEqual(
      selectProgrammeStrategy(second),
    );
  });

  it('records structured missing inputs without blocking normalization', () => {
    const profile = normalizeAthlete(beginnerFatLossAthlete);

    expect(profile.missing_inputs).toContainEqual(
      expect.objectContaining({
        field: 'training_history',
        importance: 'important',
      }),
    );
    expect(profile.planning_assumptions).toContainEqual(
      expect.objectContaining({ code: 'TRAINING_HISTORY_MISSING' }),
    );
    expect(profile.programme_confidence).toBe('low');
  });
});
