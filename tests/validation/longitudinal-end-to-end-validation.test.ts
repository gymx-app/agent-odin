import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { programmeValidationService } from '../../src/validation/programme-validation.service.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('end-to-end longitudinal validation and repair', () => {
  it('returns metrics, evaluated rules and untouched repair metadata', () => {
    const report = programmeValidationService.validateVersioned({
      programme: clone(),
      profile: createProfile(),
      exercises: seedExercises,
    });

    expect(report.passed).toBe(true);
    expect(report.metrics).toMatchObject({
      phase_count: 1,
      week_count: 4,
      cycle_length_days: 7,
      resistance_sessions: 12,
      conditioning_sessions: 4,
      deload_week_count: 0,
      error_count: 0,
    });
    expect(report.evaluated_rule_versions?.map((rule) => rule.rule_id)).toEqual(
      [
        'calendar',
        'strategy',
        'phases',
        'weeks',
        'sessions',
        'warmups',
        'cooldowns',
        'exercise-sequencing',
        'conditioning',
        'programme-coherence',
        'citation-hallucination',
      ],
    );
    expect(report.repair).toEqual({
      attempted: false,
      applied: false,
      operation_count: 0,
      operations: [],
    });
  });

  it('repairs a priority exercise placed after accessory work and revalidates', () => {
    const programme = clone();
    programme.phases.forEach((phase) =>
      phase.weeks.forEach((week) => {
        const day = week.days.find(
          (candidate) => candidate.day_type === 'resistance',
        )!;
        const accessory = {
          ...structuredClone(day.exercises[0]!),
          prescription_id: `${day.day_id}-accessory`,
          exercise_id: 'bodyweight_squat',
          exercise_name: 'Bodyweight Squat',
          display_order: 1,
          sequence_role: 'accessory' as const,
          priority: 2,
        };
        day.exercises[0]!.display_order = 2;
        day.exercises = [accessory, day.exercises[0]!];
      }),
    );

    const result = programmeValidationService.validateAndRepairVersioned({
      programme,
      profile: createProfile(),
      exercises: seedExercises,
    });

    expect(result.validation.passed).toBe(true);
    expect(result.validation.repair?.applied).toBe(true);
    expect(result.validation.repair?.operations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ operation_type: 'reorder_exercise' }),
      ]),
    );
    expect(
      result.programme.schema_version === '2.0'
        ? result.programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!
            .sequence_role
        : null,
    ).toBe('primary');
  });

  it('does not attempt unsafe repair for structural invalidity', () => {
    const programme = clone();
    programme.calendar.cycle_length_days = 8;

    const result = programmeValidationService.validateAndRepairVersioned({
      programme,
      profile: createProfile(),
      exercises: seedExercises,
    });

    expect(result.validation.passed).toBe(false);
    expect(result.validation.repair).toMatchObject({
      attempted: false,
      applied: false,
      rejection_reason: 'NON_REPAIRABLE_FINDING_PRESENT',
    });
    expect(result.programme).toEqual(programme);
  });

  it('is deterministic across validation and repair', () => {
    const input = {
      programme: clone(),
      profile: createProfile(),
      exercises: seedExercises,
    };
    expect(
      programmeValidationService.validateAndRepairVersioned(input),
    ).toEqual(programmeValidationService.validateAndRepairVersioned(input));
  });
});
