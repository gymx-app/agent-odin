import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { minimalValidOdinProgramme } from '../../fixtures/programmes/valid-programmes.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import { createProfile } from '../planning/test-planning-utils.js';

describe('longitudinal validation dispatch', () => {
  const profile = createProfile({ equipment: 'full_gym' });

  it('dispatches explicit V1 to the unchanged legacy validators', () => {
    const report = programmeValidationService.validateVersioned({
      programme: {
        ...minimalValidOdinProgramme,
        schema_version: '1.0',
        planner_version: 'legacy_v1',
      },
      profile,
      exercises: seedExercises,
    });

    expect(report).toStrictEqual(
      programmeValidationService.validate({
        programme: minimalValidOdinProgramme,
        profile,
        exercises: seedExercises,
      }),
    );
  });

  it('validates a structurally valid V2 programme', () => {
    const report = programmeValidationService.validateVersioned({
      programme: validLongitudinalProgramme,
      profile,
      exercises: seedExercises,
    });

    expect(report.status).toBe('pass');
    expect(report.findings).toEqual([]);
  });

  it('reports V2 structural failures using stable codes', () => {
    const programme = structuredClone(validLongitudinalProgramme);
    programme.calendar.cycle_length_days = 8;

    const report = programmeValidationService.validateVersioned({
      programme,
      profile,
      exercises: seedExercises,
    });

    expect(report.status).toBe('fail');
    expect(
      report.findings.every((finding) =>
        ['LONGITUDINAL_SCHEMA_INVALID', 'INVALID_CALENDAR_REFERENCE'].includes(
          finding.code,
        ),
      ),
    ).toBe(true);
  });
});
