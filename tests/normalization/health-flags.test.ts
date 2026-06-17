import { describe, expect, it } from 'vitest';
import { createHealthFlags } from '../../src/normalization/health-flags.js';
import { calculateWeightChange } from '../../src/normalization/weight-change.js';
import { completeInBody, createAthlete } from './test-athletes.js';

const flagsFor = (patch = {}) => {
  const athlete = createAthlete(patch);

  return createHealthFlags(athlete, calculateWeightChange(athlete), 135);
};

describe('createHealthFlags', () => {
  it('flags elevated visceral fat', () => {
    expect(
      flagsFor({
        inbody: {
          ...completeInBody,
          visceral_fat_area: 120,
        },
      }).some((flag) => flag.code === 'ELEVATED_VISCERAL_FAT'),
    ).toBe(true);
  });

  it('flags goal-direction inconsistency', () => {
    expect(
      flagsFor({
        goal: 'fat_loss',
        current_weight_kg: 80,
        target_weight_kg: 85,
      }).some((flag) => flag.code === 'GOAL_TARGET_DIRECTION_MISMATCH'),
    ).toBe(true);
  });

  it('flags low weekly training time', () => {
    const athlete = createAthlete({
      available_days_per_week: 2,
      session_duration_min: 20,
    });

    expect(
      createHealthFlags(athlete, calculateWeightChange(athlete), 40).some(
        (flag) => flag.code === 'LOW_TRAINING_AVAILABILITY',
      ),
    ).toBe(true);
  });

  it('does not create false blocking flags for ordinary valid input', () => {
    expect(flagsFor()).not.toContainEqual(
      expect.objectContaining({
        severity: 'blocking',
      }),
    );
  });

  it('flags implausible body fat values as blocking', () => {
    expect(
      flagsFor({
        inbody: {
          ...completeInBody,
          body_fat_pct: 75,
        },
      }).some((flag) => flag.severity === 'blocking'),
    ).toBe(true);
  });
});
