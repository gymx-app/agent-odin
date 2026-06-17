import { describe, expect, it } from 'vitest';
import {
  assessGoalFeasibility,
  estimateProgrammeHorizonWeeks,
} from '../../src/normalization/programme-horizon.js';
import { calculateWeeklyTrainingMinutes } from '../../src/normalization/weekly-training-minutes.js';
import { calculateWeightChange } from '../../src/normalization/weight-change.js';
import { completeInBody, createAthlete } from './test-athletes.js';

const horizonFor = (patch = {}) => {
  const athlete = createAthlete(patch);

  return estimateProgrammeHorizonWeeks(athlete, calculateWeightChange(athlete));
};

describe('estimateProgrammeHorizonWeeks', () => {
  it('estimates a fat-loss horizon', () => {
    expect(
      horizonFor({
        goal: 'fat_loss',
        current_weight_kg: 100,
        target_weight_kg: 90,
      }),
    ).toBe(17);
  });

  it('estimates a muscle-gain horizon with an 8-week minimum', () => {
    expect(
      horizonFor({
        goal: 'muscle_gain',
        current_weight_kg: 80,
        target_weight_kg: 81,
      }),
    ).toBe(8);
  });

  it('defaults recomposition by level and training time', () => {
    expect(
      horizonFor({
        goal: 'recomposition',
        fitness_level: 'advanced',
        current_weight_kg: 80,
        target_weight_kg: 80,
      }),
    ).toBe(24);
  });

  it('defaults strength by level', () => {
    expect(
      horizonFor({
        goal: 'strength',
        fitness_level: 'intermediate',
        current_weight_kg: 80,
        target_weight_kg: 80,
      }),
    ).toBe(12);
  });

  it('defaults endurance by level', () => {
    expect(
      horizonFor({
        goal: 'endurance',
        fitness_level: 'advanced',
        current_weight_kg: 80,
        target_weight_kg: 80,
      }),
    ).toBe(16);
  });

  it('uses a goal-appropriate horizon for zero weight change', () => {
    expect(
      horizonFor({
        goal: 'fat_loss',
        current_weight_kg: 80,
        target_weight_kg: 80,
      }),
    ).toBe(12);
  });

  it('caps very long horizons at 52 weeks', () => {
    expect(
      horizonFor({
        goal: 'fat_loss',
        current_weight_kg: 120,
        target_weight_kg: 50,
      }),
    ).toBe(52);
  });

  it('keeps advanced fat-loss planning conservative', () => {
    expect(
      horizonFor({
        goal: 'fat_loss',
        fitness_level: 'advanced',
        current_weight_kg: 100,
        target_weight_kg: 90,
        inbody: completeInBody,
      }),
    ).toBe(20);
  });
});

describe('assessGoalFeasibility', () => {
  it('reports feasible goals with sufficient information', () => {
    const athlete = createAthlete({
      inbody: completeInBody,
    });

    expect(
      assessGoalFeasibility(
        athlete,
        calculateWeightChange(athlete),
        calculateWeeklyTrainingMinutes(athlete),
      ),
    ).toEqual({
      status: 'feasible',
      reasons: [],
    });
  });

  it('reports adjusted expectations for mismatched large requests', () => {
    const athlete = createAthlete({
      goal: 'fat_loss',
      current_weight_kg: 80,
      target_weight_kg: 100,
      available_days_per_week: 2,
      session_duration_min: 20,
    });

    expect(
      assessGoalFeasibility(
        athlete,
        calculateWeightChange(athlete),
        calculateWeeklyTrainingMinutes(athlete),
      ).status,
    ).toBe('feasible_with_adjusted_expectations');
  });
});
