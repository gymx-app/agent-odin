import { describe, expect, it } from 'vitest';
import { selectTargetReps } from '../../src/planning/prescription-allocator.js';
import type { MovementSlot } from '../../src/planning/planning.types.js';
import { createProfile } from './test-planning-utils.js';

const slot: MovementSlot = {
  slot_id: 'primary',
  movement_pattern: 'squat',
  priority: 'primary',
  required: true,
  allowed_substitution_patterns: [],
  set_budget: 3,
  rep_zone: { min: 6, max: 10 },
  target_rpe_range: { min: 6, max: 8 },
};

describe('selectTargetReps', () => {
  it('selects beginner targets deterministically', () => {
    expect(
      selectTargetReps(createProfile({ fitness_level: 'beginner' }), slot),
    ).toBe(8);
  });

  it('selects intermediate targets deterministically', () => {
    expect(
      selectTargetReps(createProfile({ fitness_level: 'intermediate' }), slot),
    ).toBe(8);
  });

  it('selects lower strength targets for primary work', () => {
    expect(selectTargetReps(createProfile({ goal: 'strength' }), slot)).toBe(6);
  });

  it('selects accessory targets', () => {
    expect(
      selectTargetReps(createProfile(), {
        ...slot,
        priority: 'accessory',
        rep_zone: { min: 10, max: 15 },
      }),
    ).toBe(15);
  });

  it('overrides goal-driven targeting with the top of the rep zone when the exercise is modifiable due to a restriction', () => {
    expect(
      selectTargetReps(createProfile({ goal: 'strength' }), slot, 'modifiable'),
    ).toBe(slot.rep_zone.max);
  });
});
