import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { validateLongitudinalWeeks } from '../../src/validation/week-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('V2 week validator', () => {
  it('accepts the valid fixture weeks', () => {
    expect(validateLongitudinalWeeks(clone(), createProfile())).toEqual([]);
  });

  it.each([
    [
      'factor bounds',
      'WEEK_FACTOR_OUT_OF_RANGE',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.planned_volume_factor = 1.5;
      },
    ],
    [
      'volume spike',
      'WEEKLY_VOLUME_SPIKE',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.planned_volume_factor = 0.8;
        programme.phases[0]!.weeks[1]!.planned_volume_factor = 1.2;
      },
    ],
    [
      'RPE ceiling',
      'RPE_CEILING_BELOW_TARGET',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.planning_metadata.intensity_target.maximum_allowed_rpe = 6;
      },
    ],
    [
      'invalid testing',
      'WEEK_TYPE_INVALID',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.week_type = 'testing';
      },
    ],
    [
      'muscle volume below required',
      'MUSCLE_VOLUME_BELOW_REQUIRED',
      (programme: ReturnType<typeof clone>) => {
        // Quadriceps needs a minimum of 4 delivered sets, but zeroing out
        // squat (its only primary-muscle source in this fixture) with no
        // indirect credit leaves it at 0 delivered — this is only
        // detectable now that the check compares against what was
        // actually allocated, not against bounds derived from the same
        // target it's checking.
        programme.phases[0]!.weeks[0]!.planning_metadata.movement_pattern_budgets[0]!.set_target = 0;
      },
    ],
    [
      'muscle volume excessive',
      'MUSCLE_VOLUME_EXCESSIVE',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.planning_metadata.movement_pattern_budgets[0]!.set_target = 20;
      },
    ],
  ])('reports %s', (_name, code, mutate) => {
    const programme = clone();
    mutate(programme);
    expect(
      validateLongitudinalWeeks(programme, createProfile()).map(
        (finding) => finding.code,
      ),
    ).toContain(code);
  });

  it('rejects excluded movement volume', () => {
    const programme = clone();
    const profile = createProfile({
      movement_restrictions: [
        {
          region: 'knee',
          movement_demand: 'loaded_deep_knee_flexion',
          tolerance: 'excluded',
        },
      ],
    });

    expect(
      validateLongitudinalWeeks(programme, profile).map(
        (finding) => finding.code,
      ),
    ).toContain('EXCLUDED_MOVEMENT_VOLUME_ASSIGNED');
  });

  it('rejects infeasible session budgets', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    day.training_budget = {
      total_working_set_budget: 20,
      muscle_group_budgets: {},
      movement_pattern_budgets: {},
      intensity_intent: 'moderate',
      effort_target: 7,
      rpe_ceiling: 8,
      fatigue_ceiling: 'moderate',
      estimated_duration_min: 90,
      rationale_codes: [],
    };

    const codes = validateLongitudinalWeeks(
      programme,
      createProfile({ session_duration_min: 45 }),
    ).map(({ code }) => code);
    expect(codes).toContain('SESSION_SET_BUDGET_EXCESSIVE');
    expect(codes).toContain('SESSION_DURATION_BUDGET_INFEASIBLE');
  });

  it('requires meaningful deload reduction', () => {
    const programme = clone();
    const week = programme.phases[0]!.weeks[3]!;
    week.week_type = 'deload';
    week.planned_volume_factor = 0.95;
    week.planned_effort_factor = 1;

    expect(
      validateLongitudinalWeeks(programme, createProfile()).map(
        ({ code }) => code,
      ),
    ).toContain('DELOAD_WEEK_NOT_REDUCED');
  });
});
