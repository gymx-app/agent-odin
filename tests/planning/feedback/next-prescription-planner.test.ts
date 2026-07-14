import { describe, expect, it } from 'vitest';
import { planNextPrescription } from '../../../src/planning/feedback/next-prescription-planner.js';

const bounds = { rep_min: 6, rep_max: 10 };

const setAt = (repsAchieved: number, rpeReported: number) => ({
  target_reps: 8,
  rpe_ceiling: 8,
  reps_achieved: repsAchieved,
  rpe_reported: rpeReported,
});

describe('planNextPrescription', () => {
  it('holds the prescription when a set misses target reps', () => {
    const result = planNextPrescription(
      [setAt(7, 7), setAt(8, 7)],
      8,
      bounds,
    );
    expect(result).toMatchObject({
      next_target_reps: 8,
      increase_load: false,
      rationale_codes: ['PRESCRIPTION_HELD_TARGET_NOT_MET'],
    });
  });

  it('holds the prescription when RPE exceeds the ceiling even if reps were hit', () => {
    const result = planNextPrescription([setAt(8, 9)], 8, bounds);
    expect(result.next_target_reps).toBe(8);
    expect(result.increase_load).toBe(false);
  });

  it('progresses reps by one when all sets meet target at or below ceiling', () => {
    const result = planNextPrescription(
      [setAt(8, 7), setAt(8, 8)],
      8,
      bounds,
    );
    expect(result).toMatchObject({
      next_target_reps: 9,
      increase_load: false,
      rationale_codes: ['TARGET_REPS_PROGRESSED'],
    });
  });

  it('increases load and resets reps to the bottom of the range at the top', () => {
    const result = planNextPrescription(
      [{ target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 }],
      10,
      bounds,
    );
    expect(result).toMatchObject({
      next_target_reps: 6,
      increase_load: true,
      rationale_codes: ['TOP_OF_RANGE_REACHED_LOAD_INCREASED'],
    });
  });

  it('is deterministic', () => {
    const sets = [setAt(8, 7)];
    expect(planNextPrescription(sets, 8, bounds)).toEqual(
      planNextPrescription(sets, 8, bounds),
    );
  });
});
