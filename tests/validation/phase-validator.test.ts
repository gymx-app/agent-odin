import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { validateLongitudinalPhases } from '../../src/validation/phase-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('V2 phase validator', () => {
  it('accepts the valid fixture phases', () => {
    const programme = clone();
    expect(validateLongitudinalPhases(programme, createProfile())).toEqual([]);
  });

  it('reports boundary gaps and overlaps', () => {
    const gap = clone();
    const second = structuredClone(gap.phases[0]!);
    second.phase_id = 'second';
    second.phase_number = 2;
    second.start_week = 6;
    second.end_week = 6;
    second.weeks_count = 1;
    gap.phases.push(second);
    gap.programme.target_weeks = 6;

    expect(
      validateLongitudinalPhases(gap, createProfile()).map(({ code }) => code),
    ).toContain('PHASE_BOUNDARY_GAP');

    second.start_week = 4;
    expect(
      validateLongitudinalPhases(gap, createProfile()).map(({ code }) => code),
    ).toContain('PHASE_BOUNDARY_OVERLAP');
  });

  it('reports incoherent recovery directions', () => {
    const programme = clone();
    programme.phases[0]!.phase_type = 'recovery';
    programme.phases[0]!.volume_direction = 'increase';

    expect(
      validateLongitudinalPhases(programme, createProfile()).map(
        ({ code }) => code,
      ),
    ).toContain('PHASE_DIRECTION_INCOHERENT');
  });

  it('reports unjustified realization and deload placement', () => {
    const programme = clone();
    programme.phases[0]!.phase_type = 'realization';
    programme.fatigue_management_policy.strategy = 'planned_deload';
    programme.fatigue_management_policy.planned_deload_weeks = [1];

    const codes = validateLongitudinalPhases(programme, createProfile()).map(
      ({ code }) => code,
    );
    expect(codes).toContain('UNJUSTIFIED_REALIZATION_PHASE');
    expect(codes).toContain('DELOAD_PLACEMENT_INVALID');
  });

  it('reports incomplete horizon allocation', () => {
    const programme = clone();
    programme.phases[0]!.end_week = 3;
    programme.phases[0]!.weeks_count = 3;

    expect(
      validateLongitudinalPhases(programme, createProfile()).map(
        ({ code }) => code,
      ),
    ).toContain('INVALID_PHASE_SEQUENCE');
  });
});
