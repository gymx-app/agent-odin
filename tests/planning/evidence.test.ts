import { describe, expect, it } from 'vitest';
import { percentOneRepMaxForRpeReps } from '../../src/planning/evidence.js';

describe('percentOneRepMaxForRpeReps', () => {
  it('returns the table value for an exact RPE/rep match', () => {
    expect(percentOneRepMaxForRpeReps(8, 5)).toBe(81.1);
    expect(percentOneRepMaxForRpeReps(10, 1)).toBe(100);
  });

  it('rounds target_rpe to the nearest 0.5 before lookup', () => {
    expect(percentOneRepMaxForRpeReps(8.2, 5)).toBe(
      percentOneRepMaxForRpeReps(8, 5),
    );
    expect(percentOneRepMaxForRpeReps(8.3, 5)).toBe(
      percentOneRepMaxForRpeReps(8.5, 5),
    );
  });

  it('decreases as reps increase at a fixed RPE', () => {
    const values = [1, 3, 6, 9, 12].map(
      (reps) => percentOneRepMaxForRpeReps(8, reps)!,
    );
    values.slice(1).forEach((value, index) => {
      expect(value).toBeLessThan(values[index]!);
    });
  });

  it('increases as RPE increases at a fixed rep target', () => {
    const values = [6, 7, 8, 9, 10].map(
      (rpe) => percentOneRepMaxForRpeReps(rpe, 5)!,
    );
    values.slice(1).forEach((value, index) => {
      expect(value).toBeGreaterThan(values[index]!);
    });
  });

  it('returns undefined outside the published table range', () => {
    expect(percentOneRepMaxForRpeReps(5, 5)).toBeUndefined();
    expect(percentOneRepMaxForRpeReps(8, 13)).toBeUndefined();
    expect(percentOneRepMaxForRpeReps(8, 0)).toBeUndefined();
  });
});
