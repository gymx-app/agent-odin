import { describe, expect, it } from 'vitest';
import { evaluateReadiness } from '../../../src/planning/fatigue/readiness-evaluator.js';

const goodSet = { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 7 };
const missedSet = { target_reps: 8, rpe_ceiling: 8, reps_achieved: 6, rpe_reported: 8 };
const overshootSet = { target_reps: 8, rpe_ceiling: 8, reps_achieved: 8, rpe_reported: 9.5 };
// Ceiling <=6 sits in the self-report zone the design doc flags as less
// accurate (a set left at 4-5 RIR, RPE 5-6) — same overshoot margin as
// overshootSet above, but at a low ceiling.
const lowConfidenceOvershootSet = {
  target_reps: 12,
  rpe_ceiling: 6,
  reps_achieved: 12,
  rpe_reported: 7.5,
};

describe('evaluateReadiness', () => {
  it('does not recommend a deload for solid recent sessions', () => {
    const result = evaluateReadiness([
      { completed_sets: [goodSet, goodSet] },
      { completed_sets: [goodSet, goodSet] },
    ]);
    expect(result).toMatchObject({
      deload_recommended: false,
      triggered_reasons: [],
      deload_adjustments: {},
    });
  });

  it('does not trigger on a single bad session', () => {
    const result = evaluateReadiness([
      { completed_sets: [goodSet, goodSet] },
      { completed_sets: [missedSet, missedSet] },
    ]);
    expect(result.deload_recommended).toBe(false);
  });

  it('flags repeated performance decline after consecutive missed sessions', () => {
    const result = evaluateReadiness([
      { completed_sets: [missedSet, missedSet] },
      { completed_sets: [missedSet, missedSet] },
    ]);
    expect(result.deload_recommended).toBe(true);
    expect(result.triggered_reasons[0]).toContain('REPEATED_PERFORMANCE_DECLINE');
    expect(result.deload_adjustments).toMatchObject({
      volume_factor: 0.7,
      intensity_factor: 0.85,
      effort_factor: 0.8,
      conditioning_factor: 0.8,
    });
  });

  it('flags persistent RPE elevation after consecutive high-RPE sessions', () => {
    const result = evaluateReadiness([
      { completed_sets: [overshootSet, overshootSet] },
      { completed_sets: [overshootSet, overshootSet] },
    ]);
    expect(result.deload_recommended).toBe(true);
    expect(result.triggered_reasons[0]).toContain('PERSISTENT_RPE_ELEVATION');
  });

  it('does not trigger persistent RPE elevation on just 2 low-confidence-zone sessions', () => {
    const result = evaluateReadiness([
      { completed_sets: [lowConfidenceOvershootSet, lowConfidenceOvershootSet] },
      { completed_sets: [lowConfidenceOvershootSet, lowConfidenceOvershootSet] },
    ]);
    expect(result.deload_recommended).toBe(false);
  });

  it('triggers persistent RPE elevation on 3 consecutive low-confidence-zone sessions, with the relaxed-threshold note', () => {
    const result = evaluateReadiness([
      { completed_sets: [lowConfidenceOvershootSet, lowConfidenceOvershootSet] },
      { completed_sets: [lowConfidenceOvershootSet, lowConfidenceOvershootSet] },
      { completed_sets: [lowConfidenceOvershootSet, lowConfidenceOvershootSet] },
    ]);
    expect(result.deload_recommended).toBe(true);
    expect(result.triggered_reasons[0]).toContain('PERSISTENT_RPE_ELEVATION');
    expect(result.triggered_reasons[0]).toContain('last 3 sessions');
    expect(result.triggered_reasons[0]).toContain('relaxed threshold');
  });

  it('only evaluates the most recent sessions in a longer history', () => {
    const result = evaluateReadiness([
      { completed_sets: [missedSet, missedSet] },
      { completed_sets: [goodSet, goodSet] },
      { completed_sets: [goodSet, goodSet] },
    ]);
    expect(result.deload_recommended).toBe(false);
  });

  it('is deterministic', () => {
    const sessions = [
      { completed_sets: [missedSet] },
      { completed_sets: [missedSet] },
    ];
    expect(evaluateReadiness(sessions)).toEqual(evaluateReadiness(sessions));
  });
});
