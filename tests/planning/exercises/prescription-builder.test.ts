import { describe, expect, it } from 'vitest';
import { restSeconds } from '../../../src/planning/exercises/prescription-builder.js';
import type {
  ExerciseCandidate,
  MovementSlotV2,
} from '../../../src/planning/sessions/session.types.js';
import { createExercisePatch } from '../../exercises/test-exercise-utils.js';

const slot = (
  sequence_role: MovementSlotV2['sequence_role'],
): MovementSlotV2 => ({
  slot_id: 'slot-1',
  movement_pattern: 'horizontal_push',
  allowed_substitution_patterns: [],
  target_muscle_groups: ['chest'],
  sequence_role,
  priority: 1,
  required: true,
  set_budget: 3,
  rep_zone: { min: 6, max: 10 },
  target_rpe: 7,
  rpe_ceiling: 8,
  fatigue_budget: {
    systemic: 'moderate',
    local: 'moderate',
    grip: 'low',
    lower_back: 'low',
  },
  progression_policy_id: 'double_progression',
});

const candidate = (
  defaultRestSeconds: { min: number; max: number } = { min: 0, max: 600 },
): ExerciseCandidate => ({
  exercise: createExercisePatch({ default_rest_seconds: defaultRestSeconds }),
  status: 'eligible',
  warnings: [],
  restriction_tags: [],
  score: 1,
  rationale_codes: [],
});

describe('restSeconds', () => {
  it('gives a heavy low-rep primary lift more rest than its role default', () => {
    expect(restSeconds(slot('primary'), candidate(), 5)).toBe(210);
  });

  it('does not shorten a hypertrophy-rep primary lift below its role default', () => {
    // Schoenfeld et al. (2016): 3-min rest beat 1-min for both strength
    // and hypertrophy outcomes at compound lifts, even at 8-12 reps.
    expect(restSeconds(slot('primary'), candidate(), 8)).toBe(180);
  });

  it('shortens rest for high-rep metabolic work regardless of role', () => {
    expect(restSeconds(slot('primary'), candidate(), 18)).toBe(60);
    expect(restSeconds(slot('isolation'), candidate(), 18)).toBe(60);
  });

  it('keeps isolation work at its own role default in the mid rep range', () => {
    expect(restSeconds(slot('isolation'), candidate(), 10)).toBe(75);
  });

  it('clamps to the exercise-specific rest window even when load intent asks for more', () => {
    expect(
      restSeconds(slot('primary'), candidate({ min: 60, max: 150 }), 5),
    ).toBe(150);
  });
});
