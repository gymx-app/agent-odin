import { describe, expect, it } from 'vitest';
import { ProgrammeRefinementProposalSchema } from '../../src/llm/refinement.schema.js';
import { operation, proposal } from './test-refinement.js';

describe('ProgrammeRefinementProposalSchema', () => {
  it('accepts a strict no-change proposal', () => {
    expect(
      ProgrammeRefinementProposalSchema.safeParse(proposal([])).success,
    ).toBe(true);
  });

  it('accepts bounded rep and RPE operations', () => {
    const value = proposal([
      operation({
        type: 'adjust_target_reps',
        day_of_week: 'MON',
        exercise_id: 'bodyweight_squat',
        set_number: 1,
        new_target_reps: 10,
        reason_code: 'GOAL_SPECIFICITY',
      }),
      operation({
        operation_id: 'operation_2',
        type: 'adjust_target_rpe',
        day_of_week: 'MON',
        exercise_id: 'bodyweight_squat',
        set_number: 1,
        new_target_rpe: 7,
        new_rpe_ceiling: 8,
        reason_code: 'FATIGUE_REDUCTION',
      }),
    ]);

    expect(ProgrammeRefinementProposalSchema.safeParse(value).success).toBe(
      true,
    );
  });

  it('rejects unknown operations, missing fields, invalid RPE and extra properties', () => {
    const invalid = {
      ...proposal([
        operation({
          type: 'adjust_target_rpe',
          day_of_week: 'MON',
          exercise_id: 'bodyweight_squat',
          set_number: 1,
          new_target_rpe: 8,
          new_rpe_ceiling: 7,
        }),
      ]),
      unexpected: true,
    };

    expect(ProgrammeRefinementProposalSchema.safeParse(invalid).success).toBe(
      false,
    );
    expect(
      ProgrammeRefinementProposalSchema.safeParse({
        ...proposal([]),
        decision: 'refine',
        operations: [{ type: 'invent_programme' }],
      }).success,
    ).toBe(false);
  });

  it('rejects fields unrelated to the selected operation type', () => {
    expect(
      ProgrammeRefinementProposalSchema.safeParse(
        proposal([
          operation({
            type: 'update_subtitle',
            day_of_week: 'MON',
            new_subtitle: 'Controlled session',
            replacement_exercise_id: 'bodyweight_squat',
          }),
        ]),
      ).success,
    ).toBe(false);
  });
});
