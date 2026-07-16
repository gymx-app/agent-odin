import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { LongitudinalOdinProgrammeSchema } from '../../src/domain/programme/programme.schema.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('ExercisePrescription.set_structure schema', () => {
  it('accepts the valid fixture (straight sets, no detail object)', () => {
    expect(LongitudinalOdinProgrammeSchema.safeParse(clone()).success).toBe(
      true,
    );
  });

  it('rejects a drop_set with no drop_set_detail', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.set_structure = {
      type: 'drop_set',
      rationale_codes: ['TIME_CONSTRAINED_SESSION'],
    };
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('rejects a straight-set exercise that carries a mismatched detail object', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.set_structure = {
      type: 'straight',
      cluster_detail: { intra_set_rest_seconds: 20 },
      rationale_codes: [],
    };
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('rejects a non-straight structure with no rationale_codes', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.set_structure = {
      type: 'pyramid',
      rationale_codes: [],
    };
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('accepts a correctly-shaped cluster set', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.set_structure = {
      type: 'cluster',
      cluster_detail: { intra_set_rest_seconds: 20 },
      rationale_codes: ['TUFANO_2016_CLUSTER_VELOCITY'],
    };
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      true,
    );
  });
});

describe('superset_group_id day-level consistency', () => {
  const groupedDay = (
    overrides: {
      firstType?: 'superset' | 'giant_set';
      secondType?: 'superset' | 'giant_set';
      secondOrder?: number;
    } = {},
  ) => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    const first = day.exercises[0]!;
    first.superset_group_id = 'group-1';
    first.set_structure = {
      type: overrides.firstType ?? 'superset',
      rationale_codes: ['TIME_EFFICIENCY'],
    };
    day.exercises.push({
      ...structuredClone(first),
      prescription_id: 'second-in-group',
      exercise_id: 'dumbbell_lateral_raise',
      exercise_name: 'Dumbbell Lateral Raise',
      display_order: overrides.secondOrder ?? 2,
      set_structure: {
        type: overrides.secondType ?? overrides.firstType ?? 'superset',
        rationale_codes: ['TIME_EFFICIENCY'],
      },
    });
    return programme;
  };

  it('accepts a 2-member group with matching type and contiguous display_order', () => {
    expect(
      LongitudinalOdinProgrammeSchema.safeParse(groupedDay()).success,
    ).toBe(true);
  });

  it('rejects a group whose members disagree on set_structure.type', () => {
    const programme = groupedDay({
      firstType: 'superset',
      secondType: 'giant_set',
    });
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('rejects a group with non-contiguous display_order values', () => {
    const programme = groupedDay({ secondOrder: 5 });
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });
});
