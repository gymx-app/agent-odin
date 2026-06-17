import { describe, expect, it } from 'vitest';
import {
  getNextTargetReps,
  progressionPolicy,
  shouldIncreaseLoad,
} from '../../src/planning/progression-policy.js';

describe('progression policy', () => {
  it('progresses target reps deterministically', () => {
    expect(getNextTargetReps(true, 10, 12)).toBe(11);
  });

  it('does not exceed progression maximum', () => {
    expect(getNextTargetReps(true, 12, 12)).toBe(12);
  });

  it('triggers load progression at the top of range', () => {
    expect(shouldIncreaseLoad(true, 12, 12)).toBe(true);
  });

  it('maintains when minimum reps are missed', () => {
    expect(getNextTargetReps(false, 8, 12)).toBe(8);
  });

  it('never prescribes a specific weight', () => {
    expect(progressionPolicy.loadPrescription.toLowerCase()).not.toContain(
      'kg',
    );
  });
});
