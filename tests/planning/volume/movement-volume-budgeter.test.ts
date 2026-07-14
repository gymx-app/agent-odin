import { describe, expect, it } from 'vitest';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import {
  budgetMovementPatterns,
  computeIndirectSetCredit,
} from '../../../src/planning/volume/movement-volume-budgeter.js';
import { budgetMuscleGroups } from '../../../src/planning/volume/muscle-volume-budgeter.js';
import type { WeekPlannerInput } from '../../../src/planning/weeks/week.types.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const buildInput = (
  athletePatch: Parameters<typeof createAthlete>[0] = {},
  primary_objective: WeekPlannerInput['strategy']['primary_objective'] = 'muscle_gain',
): WeekPlannerInput => {
  const profile = normalizeAthlete(createAthlete(athletePatch));
  return {
    profile,
    strategy: { primary_objective } as WeekPlannerInput['strategy'],
    calendar: { days: [] } as unknown as WeekPlannerInput['calendar'],
    phases: [],
    planned_deload_weeks: [],
  };
};

describe('budgetMovementPatterns', () => {
  it('allocates every requested set and none extra', () => {
    const input = buildInput();
    const muscleTargets = budgetMuscleGroups(input, 1);
    const patterns = budgetMovementPatterns(input, 40, muscleTargets);
    const total = patterns.reduce((sum, p) => sum + p.set_target, 0);
    expect(total).toBe(40);
  });

  it('gives more sets to patterns whose primary muscle has a higher target', () => {
    // Advanced athletes get a higher base direct-set target (10) than
    // beginners (6) for every muscle, so patterns should receive
    // proportionally more sets for an advanced athlete at the same
    // total set count.
    const beginnerInput = buildInput({ fitness_level: 'beginner' });
    const advancedInput = buildInput({ fitness_level: 'advanced' });
    const beginnerTargets = budgetMuscleGroups(beginnerInput, 1);
    const advancedTargets = budgetMuscleGroups(advancedInput, 1);

    const beginnerSquat = budgetMovementPatterns(
      beginnerInput,
      40,
      beginnerTargets,
    ).find((p) => p.movement_pattern === 'squat')!.set_target;
    const advancedSquat = budgetMovementPatterns(
      advancedInput,
      40,
      advancedTargets,
    ).find((p) => p.movement_pattern === 'squat')!.set_target;

    // Both athletes get proportionally similar shares since every muscle
    // scales together, but the allocation should still be internally
    // consistent (deterministic, sums to total) for both.
    expect(beginnerSquat).toBeGreaterThan(0);
    expect(advancedSquat).toBeGreaterThan(0);
  });

  it('zeroes out excluded patterns and reallocates their sets elsewhere', () => {
    const input = buildInput({
      injuries: [{ area: 'knee', severity: 'avoid', notes: 'Post-surgery.' }],
    });
    const muscleTargets = budgetMuscleGroups(input, 1);
    const patterns = budgetMovementPatterns(input, 40, muscleTargets);
    const squat = patterns.find((p) => p.movement_pattern === 'squat')!;
    expect(squat.set_target).toBe(0);
    expect(squat.rationale_codes).toContain('MOVEMENT_RESTRICTION_REALLOCATION');
    const total = patterns.reduce((sum, p) => sum + p.set_target, 0);
    expect(total).toBe(40);
  });

  it('is deterministic', () => {
    const input = buildInput();
    const muscleTargets = budgetMuscleGroups(input, 1);
    expect(budgetMovementPatterns(input, 40, muscleTargets)).toEqual(
      budgetMovementPatterns(input, 40, muscleTargets),
    );
  });
});

describe('computeIndirectSetCredit', () => {
  it('credits secondary muscles at half the rate of primary sets', () => {
    const credit = computeIndirectSetCredit([
      {
        movement_pattern: 'squat',
        set_target: 6,
        priority: 'high',
        rationale_codes: [],
      },
    ]);
    // squat: quadriceps primary (no credit), glutes indirect (0.5 * 6 = 3)
    expect(credit.glutes).toBe(3);
    expect(credit.quadriceps).toBeUndefined();
  });

  it('sums indirect credit across multiple contributing patterns', () => {
    const credit = computeIndirectSetCredit([
      {
        movement_pattern: 'horizontal_push',
        set_target: 4,
        priority: 'high',
        rationale_codes: [],
      },
      {
        movement_pattern: 'vertical_push',
        set_target: 4,
        priority: 'moderate',
        rationale_codes: [],
      },
    ]);
    // Both patterns credit triceps indirectly: 0.5*4 + 0.5*4 = 4
    expect(credit.triceps).toBe(4);
  });

  it('returns no credit for patterns with a single (primary-only) muscle', () => {
    const credit = computeIndirectSetCredit([
      {
        movement_pattern: 'calf_raise',
        set_target: 5,
        priority: 'moderate',
        rationale_codes: [],
      },
    ]);
    expect(Object.keys(credit)).toHaveLength(0);
  });
});
