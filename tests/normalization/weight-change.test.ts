import { describe, expect, it } from 'vitest';
import { calculateWeightChange } from '../../src/normalization/weight-change.js';
import { createAthlete } from './test-athletes.js';

describe('calculateWeightChange', () => {
  it('detects loss', () => {
    expect(
      calculateWeightChange(
        createAthlete({
          current_weight_kg: 100,
          target_weight_kg: 90,
        }),
      ),
    ).toEqual({
      absolute_change_kg: 10,
      percentage_change_from_start: 10,
      direction: 'loss',
    });
  });

  it('detects gain', () => {
    expect(
      calculateWeightChange(
        createAthlete({
          current_weight_kg: 80,
          target_weight_kg: 84,
        }),
      ).direction,
    ).toBe('gain');
  });

  it('detects maintenance', () => {
    expect(
      calculateWeightChange(
        createAthlete({
          current_weight_kg: 80,
          target_weight_kg: 80,
        }),
      ).direction,
    ).toBe('maintain');
  });

  it('calculates percentage change from starting weight', () => {
    expect(
      calculateWeightChange(
        createAthlete({
          current_weight_kg: 75,
          target_weight_kg: 70,
        }),
      ).percentage_change_from_start,
    ).toBe(6.7);
  });
});
