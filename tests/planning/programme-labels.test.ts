import { describe, expect, it } from 'vitest';
import {
  exerciseDisplayName,
  programmeNameForGoal,
  workoutTitle,
} from '../../src/planning/programme-labels.js';

describe('programme labels', () => {
  it('creates concise programme names', () => {
    expect(programmeNameForGoal('fat_loss')).toBe('Fat Loss Base');
  });

  it('uses canonical workout titles', () => {
    expect(workoutTitle({ kind: 'upper', emphasis: 'Strength' })).toBe(
      'Upper Body — Strength',
    );
  });

  it('does not use arbitrary A/B labels', () => {
    expect(
      workoutTitle({ kind: 'lower', emphasis: 'Quad Focus' }),
    ).not.toContain('A');
  });

  it('normalizes exercise names to common gym terminology', () => {
    expect(exerciseDisplayName('Dumbbell Bench Press')).toBe('DB Bench Press');
  });

  it('keeps grip details out of display names', () => {
    expect(exerciseDisplayName('Dumbbell Bench Press')).not.toContain('Grip');
  });
});
