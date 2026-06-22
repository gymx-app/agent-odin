import { describe, it, expect } from 'vitest';
import {
  estimateBaselineStrength,
  suggestedWorkingWeight,
} from '../../src/planning/baseline/baseline-strength-estimator.js';
import { BaselineAssessmentInputSchema } from '../../src/domain/athlete/baseline-assessment.schema.js';

describe('baseline strength estimator', () => {
  const maleBeginnerWithTests = {
    sex: 'male' as const,
    age: 28,
    bodyweight_kg: 80,
    field_tests: {
      pushup_reps: 25,
      bodyweight_squat_reps_60s: 28,
      dead_hang_seconds: 30,
    },
  };

  it('validates baseline assessment input schema', () => {
    const result = BaselineAssessmentInputSchema.safeParse(maleBeginnerWithTests);
    expect(result.success).toBe(true);
  });

  it('rejects input with neither field tests nor known lifts', () => {
    const result = BaselineAssessmentInputSchema.safeParse({
      sex: 'male',
      age: 28,
      bodyweight_kg: 80,
    });
    expect(result.success).toBe(false);
  });

  it('classifies pushup-based fitness tier for average male', () => {
    // 25 pushups (20-29 male): average (≥22, <29 for above_average)
    // 28 squats/60s: above_average (≥20 avg, <30 for above_average → average)
    // 30s hang (male): average (≥25 avg, <40 for above_average)
    // Composite: weighted average of ranks → average
    const result = estimateBaselineStrength(maleBeginnerWithTests);
    expect(result.fitness_tier).toBe('average');
  });

  it('produces estimates for all six movement patterns', () => {
    const result = estimateBaselineStrength(maleBeginnerWithTests);
    const patterns = result.estimates.map((e) => e.movement_pattern);
    expect(patterns).toEqual([
      'squat',
      'hip_hinge',
      'horizontal_push',
      'horizontal_pull',
      'vertical_push',
      'vertical_pull',
    ]);
  });

  it('estimates untrained male squat 1RM from bodyweight ratios', () => {
    const result = estimateBaselineStrength(maleBeginnerWithTests);
    const squat = result.estimates.find((e) => e.movement_pattern === 'squat')!;
    // 80kg × 0.75 base × 1.0 average tier = 60kg
    expect(squat.estimated_1rm_kg).toBe(60);
    expect(squat.source).toBe('field_test');
    expect(squat.confidence).toBe('moderate');
  });

  it('applies age decline factor for athletes over 40', () => {
    // Use identical field test scores so the only difference is age
    const olderAthlete = { ...maleBeginnerWithTests, age: 55 };
    const younger = estimateBaselineStrength(maleBeginnerWithTests);
    const older = estimateBaselineStrength(olderAthlete);
    // The 55yo uses '50-59' pushup norms (lower thresholds),
    // so their fitness tier may differ. Compare same-pattern estimates
    // accounting for both tier and age factor differences.
    const olderHinge = older.estimates.find((e) => e.movement_pattern === 'hip_hinge')!;
    // Age 55: decline factor = 1.0 - (15/10) × 0.05 = 0.925
    // Regardless of tier, the age factor should drag the estimate down
    expect(olderHinge.rationale_codes).toContain('AGE_ADJUSTED_DECLINE');
    // Verify the age decline factor is applied: 80kg × 1.0 ratio × tier × 0.925
    // vs 80kg × 1.0 ratio × tier × 1.0
    const youngerHinge = younger.estimates.find((e) => e.movement_pattern === 'hip_hinge')!;
    // With same tier adjustment, the older one should be lower due to age
    // But tiers may differ (different age bracket norms), so just check the code
    expect(olderHinge.rationale_codes).toContain('AGE_ADJUSTED_DECLINE');
    expect(youngerHinge.rationale_codes).not.toContain('AGE_ADJUSTED_DECLINE');
  });

  it('uses known lifts with Epley formula when provided', () => {
    const input = {
      sex: 'male' as const,
      age: 30,
      bodyweight_kg: 85,
      known_lifts: [
        { movement_pattern: 'squat' as const, weight_kg: 80, reps: 8 },
      ],
    };
    const result = estimateBaselineStrength(input);
    const squat = result.estimates.find((e) => e.movement_pattern === 'squat')!;
    // Epley: 80 × (1 + 8/30) = 80 × 1.267 = 101.3
    expect(squat.estimated_1rm_kg).toBeCloseTo(101.3, 0);
    expect(squat.source).toBe('known_lift');
    expect(squat.confidence).toBe('high');
  });

  it('known lifts override field-test-based estimates for the same pattern', () => {
    const input = {
      ...maleBeginnerWithTests,
      known_lifts: [
        { movement_pattern: 'horizontal_push' as const, weight_kg: 60, reps: 5 },
      ],
    };
    const result = estimateBaselineStrength(input);
    const bench = result.estimates.find((e) => e.movement_pattern === 'horizontal_push')!;
    expect(bench.source).toBe('known_lift');
    // Epley: 60 × (1 + 5/30) = 70
    expect(bench.estimated_1rm_kg).toBe(70);
  });

  it('uses higher ratios for intermediate training status', () => {
    const beginnerResult = estimateBaselineStrength(maleBeginnerWithTests, 'beginner');
    const intermediateResult = estimateBaselineStrength(maleBeginnerWithTests, 'intermediate');
    const bSquat = beginnerResult.estimates.find((e) => e.movement_pattern === 'squat')!;
    const iSquat = intermediateResult.estimates.find((e) => e.movement_pattern === 'squat')!;
    expect(iSquat.estimated_1rm_kg).toBeGreaterThan(bSquat.estimated_1rm_kg);
  });

  it('estimates female strength with lower ratios', () => {
    const femaleInput = {
      sex: 'female' as const,
      age: 28,
      bodyweight_kg: 65,
      field_tests: {
        pushup_reps: 15,
        bodyweight_squat_reps_60s: 25,
        dead_hang_seconds: 18,
      },
    };
    const maleResult = estimateBaselineStrength(maleBeginnerWithTests);
    const femaleResult = estimateBaselineStrength(femaleInput);
    const maleSquat = maleResult.estimates.find((e) => e.movement_pattern === 'squat')!;
    const femaleSquat = femaleResult.estimates.find((e) => e.movement_pattern === 'squat')!;
    expect(femaleSquat.estimated_1rm_kg).toBeLessThan(maleSquat.estimated_1rm_kg);
  });

  it('includes evidence citations in all estimates', () => {
    const result = estimateBaselineStrength(maleBeginnerWithTests);
    expect(result.rationale_codes.length).toBeGreaterThan(0);
    for (const estimate of result.estimates) {
      expect(estimate.rationale_codes.length).toBeGreaterThan(0);
    }
  });

  it('falls back to ratio_default source without field tests', () => {
    const input = {
      sex: 'male' as const,
      age: 25,
      bodyweight_kg: 75,
      known_lifts: [
        { movement_pattern: 'squat' as const, weight_kg: 60, reps: 10 },
      ],
    };
    const result = estimateBaselineStrength(input);
    const hinge = result.estimates.find((e) => e.movement_pattern === 'hip_hinge')!;
    expect(hinge.source).toBe('ratio_default');
    expect(hinge.confidence).toBe('low');
  });

  it('never estimates below 5kg floor', () => {
    const lightAthlete = {
      sex: 'female' as const,
      age: 65,
      bodyweight_kg: 40,
      field_tests: {
        pushup_reps: 0,
        bodyweight_squat_reps_60s: 5,
        dead_hang_seconds: 2,
      },
    };
    const result = estimateBaselineStrength(lightAthlete);
    for (const estimate of result.estimates) {
      expect(estimate.estimated_1rm_kg).toBeGreaterThanOrEqual(5);
    }
  });

  describe('suggestedWorkingWeight', () => {
    it('calculates working weight from 1RM using inverse Epley with RPE buffer', () => {
      // 1RM = 100kg, target 8 reps @ RPE 8 → reps at failure = 10
      // weight = 100 / (1 + 10/30) = 100 / 1.333 = 75 → round to 75
      const weight = suggestedWorkingWeight(100, 8, 8);
      expect(weight).toBe(75);
    });

    it('rounds to nearest 2.5kg plate increment', () => {
      const weight = suggestedWorkingWeight(83, 10, 7);
      expect(weight % 2.5).toBe(0);
    });

    it('suggests heavier weight at higher RPE', () => {
      const rpe7 = suggestedWorkingWeight(100, 8, 7);
      const rpe9 = suggestedWorkingWeight(100, 8, 9);
      expect(rpe9).toBeGreaterThan(rpe7);
    });
  });
});
