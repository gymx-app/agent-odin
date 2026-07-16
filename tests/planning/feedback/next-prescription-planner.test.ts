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
    expect(result.next_target_weight_kg).toBeUndefined();
  });

  it('computes an actual next_target_weight_kg (not just a flag) when current_weight_kg is known', () => {
    const result = planNextPrescription(
      [{ target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 }],
      10,
      { ...bounds, current_weight_kg: 100 },
    );
    expect(result.increase_load).toBe(true);
    expect(result.next_target_weight_kg).toBe(102.5);
  });

  it('does not fabricate a next_target_weight_kg when current_weight_kg is unknown', () => {
    const result = planNextPrescription(
      [{ target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 }],
      10,
      bounds,
    );
    expect(result.increase_load).toBe(true);
    expect(result.next_target_weight_kg).toBeUndefined();
  });

  it('holds reps at the top of the range instead of increasing load when load progression is suppressed', () => {
    const result = planNextPrescription(
      [{ target_reps: 10, rpe_ceiling: 8, reps_achieved: 10, rpe_reported: 8 }],
      10,
      { ...bounds, load_increment_type: 'none' },
    );
    expect(result).toMatchObject({
      next_target_reps: 10,
      increase_load: false,
      rationale_codes: ['LOAD_PROGRESSION_SUPPRESSED_REPS_HELD'],
    });
  });

  it('still progresses reps toward the top of the range when load progression is suppressed but reps have room left', () => {
    const result = planNextPrescription(
      [setAt(8, 7), setAt(8, 8)],
      8,
      { ...bounds, load_increment_type: 'none' },
    );
    expect(result).toMatchObject({
      next_target_reps: 9,
      increase_load: false,
      rationale_codes: ['TARGET_REPS_PROGRESSED'],
    });
  });

  it('is deterministic', () => {
    const sets = [setAt(8, 7)];
    expect(planNextPrescription(sets, 8, bounds)).toEqual(
      planNextPrescription(sets, 8, bounds),
    );
  });
});
