import { describe, expect, it } from 'vitest';
import { calculateWeeklyTrainingMinutes } from '../../src/normalization/weekly-training-minutes.js';
import { createAthlete } from './test-athletes.js';

describe('calculateWeeklyTrainingMinutes', () => {
  it('multiplies available days by session duration', () => {
    expect(
      calculateWeeklyTrainingMinutes(
        createAthlete({
          available_days_per_week: 3,
          session_duration_min: 45,
        }),
      ),
    ).toBe(135);
  });

  it('supports the minimum valid input', () => {
    expect(
      calculateWeeklyTrainingMinutes(
        createAthlete({
          available_days_per_week: 2,
          session_duration_min: 20,
        }),
      ),
    ).toBe(40);
  });

  it('supports the maximum valid input', () => {
    expect(
      calculateWeeklyTrainingMinutes(
        createAthlete({
          available_days_per_week: 7,
          session_duration_min: 180,
        }),
      ),
    ).toBe(1260);
  });
});
