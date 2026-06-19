import { describe, expect, it } from 'vitest';
import { fillMovementSlot } from '../../src/planning/exercise-slot-filler.js';
import type { MovementSlot } from '../../src/planning/planning.types.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile } from './test-planning-utils.js';

const slot: MovementSlot = {
  slot_id: 'squat',
  movement_pattern: 'squat',
  priority: 'primary',
  required: true,
  allowed_substitution_patterns: [],
  set_budget: 3,
  rep_zone: { min: 6, max: 10 },
  target_rpe_range: { min: 6, max: 8 },
};

describe('fillMovementSlot', () => {
  it('selects eligible exercises before modifiable exercises', () => {
    expect(
      fillMovementSlot(
        slot,
        createProfile({
          equipment: 'full_gym',
          injuries: [
            {
              area: 'knee',
              severity: 'modify',
              notes: 'Modify knee flexion.',
            },
          ],
        }),
        seedExercises,
      ).status,
    ).toBe('modifiable');
  });

  it('respects beginner difficulty compatibility', () => {
    expect(
      fillMovementSlot(
        {
          ...slot,
          movement_pattern: 'horizontal_push',
        },
        createProfile({
          equipment: 'full_gym',
          fitness_level: 'beginner',
        }),
        seedExercises,
      ).exercise.difficulty,
    ).toBe('beginner');
  });

  it('is deterministic for identical inputs', () => {
    const profile = createProfile({ equipment: 'full_gym' });

    expect(fillMovementSlot(slot, profile, seedExercises)).toStrictEqual(
      fillMovementSlot(slot, profile, seedExercises),
    );
  });

  it('prefers lower fatigue when recovery is low', () => {
    const profile = {
      ...createProfile({ equipment: 'full_gym' }),
      recovery_capacity: 'low' as const,
    };

    expect(fillMovementSlot(slot, profile, seedExercises).exercise.id).toBe(
      'bodyweight_squat',
    );
  });

  it('prefers an exact movement match over an easier substitution', () => {
    const selected = fillMovementSlot(
      {
        ...slot,
        movement_pattern: 'vertical_push',
        allowed_substitution_patterns: ['shoulder_abduction'],
      },
      createProfile({
        equipment: 'full_gym',
        fitness_level: 'intermediate',
      }),
      seedExercises,
    );

    expect(selected.exercise.movement_patterns).toContain('vertical_push');
  });
});
