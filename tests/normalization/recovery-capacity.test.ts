import { describe, expect, it } from 'vitest';
import { estimateRecoveryCapacity } from '../../src/normalization/recovery-capacity.js';
import { classifyRecoveryCapacity } from '../../src/normalization/recovery-capacity.js';
import { completeInBody, createAthlete } from './test-athletes.js';

describe('estimateRecoveryCapacity', () => {
  it('returns a conservative beginner estimate', () => {
    expect(estimateRecoveryCapacity(createAthlete(), 135, [])).toBe('moderate');
  });

  it('returns a moderate intermediate estimate', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          fitness_level: 'intermediate',
          available_days_per_week: 4,
        }),
        240,
        [],
      ),
    ).toBe('moderate');
  });

  it('does not automatically give advanced users high recovery', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          fitness_level: 'advanced',
          available_days_per_week: 5,
          inbody: completeInBody,
        }),
        450,
        [],
      ),
    ).toBe('moderate');
  });

  it('reduces estimate when multiple injuries are present', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          injuries: [
            {
              area: 'knee',
              severity: 'modify',
              notes: 'Sensitive.',
            },
            {
              area: 'shoulder',
              severity: 'modify',
              notes: 'Sensitive.',
            },
          ],
        }),
        135,
        [],
      ),
    ).toBe('low');
  });

  it('uses multiple positive lifestyle signals for high recovery', () => {
    expect(
      classifyRecoveryCapacity(
        createAthlete({
          lifestyle: {
            sleep_hours: 8,
            sleep_quality: 8,
            perceived_stress: 4,
            recovery_rating: 8,
            shift_work: false,
          },
        }),
        180,
        [],
      ),
    ).toMatchObject({ value: 'high', confidence: 'high' });
  });

  it('uses poor sleep, high stress and shift work for low recovery', () => {
    expect(
      classifyRecoveryCapacity(
        createAthlete({
          lifestyle: {
            sleep_hours: 5,
            sleep_quality: 3,
            perceived_stress: 9,
            recovery_rating: 3,
            shift_work: true,
          },
        }),
        180,
        [],
      ).value,
    ).toBe('low');
  });

  it('uses the legacy fallback with low confidence when lifestyle is missing', () => {
    expect(classifyRecoveryCapacity(createAthlete(), 135, [])).toMatchObject({
      value: 'moderate',
      confidence: 'low',
      reason_codes: ['LEGACY_RECOVERY_INPUTS_ONLY'],
    });
  });

  it('does not let age alone force low recovery', () => {
    expect(
      classifyRecoveryCapacity(
        createAthlete({
          age: 65,
          lifestyle: {
            sleep_hours: 8,
            sleep_quality: 8,
            perceived_stress: 4,
            recovery_rating: 8,
            shift_work: false,
          },
        }),
        180,
        [],
      ).value,
    ).not.toBe('low');
  });
});
