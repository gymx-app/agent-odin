import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { minimalValidOdinProgramme } from '../../fixtures/programmes/valid-programmes.js';
import {
  LongitudinalOdinProgrammeSchema,
  VersionedOdinProgrammeSchema,
} from '../../src/domain/programme/programme.schema.js';
import {
  isLegacyProgramme,
  isLongitudinalProgramme,
  toLegacyProgramme,
} from '../../src/domain/programme/programme-compatibility.js';
import type { LongitudinalOdinProgramme } from '../../src/domain/programme/programme.types.js';

const clone = (): LongitudinalOdinProgramme =>
  structuredClone(validLongitudinalProgramme);

const versionedLegacy = {
  ...minimalValidOdinProgramme,
  schema_version: '1.0' as const,
  planner_version: 'legacy_v1' as const,
};

describe('versioned programme contracts', () => {
  it('parses explicit V1 and V2 programmes and rejects unknown versions', () => {
    expect(
      VersionedOdinProgrammeSchema.safeParse(versionedLegacy).success,
    ).toBe(true);
    expect(
      VersionedOdinProgrammeSchema.safeParse(validLongitudinalProgramme)
        .success,
    ).toBe(true);
    expect(
      VersionedOdinProgrammeSchema.safeParse({
        ...validLongitudinalProgramme,
        schema_version: '3.0',
      }).success,
    ).toBe(false);
  });

  it('discriminates legacy and longitudinal programmes', () => {
    expect(isLegacyProgramme(versionedLegacy)).toBe(true);
    expect(isLongitudinalProgramme(versionedLegacy)).toBe(false);
    expect(isLongitudinalProgramme(validLongitudinalProgramme)).toBe(true);
    expect(isLegacyProgramme(validLongitudinalProgramme)).toBe(false);
  });

  it('accepts an explicit eight-day rolling cycle', () => {
    const programme = clone();
    programme.strategy.cycle_length_days = 8;
    programme.calendar.cycle_type = 'rolling';
    programme.calendar.cycle_length_days = 8;
    programme.calendar.days.push({
      cycle_day: 8,
      planned_session_type: 'rest',
      session_label: 'Cycle Rest',
    });
    programme.phases[0]!.weeks.forEach((week) => {
      week.days.push({
        day_id: `${week.week_id}-day-8`,
        cycle_day: 8,
        day_type: 'rest',
        title: 'Cycle Rest',
        estimated_duration_min: null,
        maximum_duration_min: null,
        fatigue_classification: 'none',
        movement_emphasis: [],
        warmup: [],
        exercises: [],
        conditioning: [],
        cooldown: [],
      });
    });

    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      true,
    );
  });

  it.each([
    [
      'duplicate week number',
      (programme: LongitudinalOdinProgramme) => {
        programme.phases[0]!.weeks[1]!.week_number = 1;
      },
    ],
    [
      'incorrect phase week count',
      (programme: LongitudinalOdinProgramme) => {
        programme.phases[0]!.weeks_count = 3;
      },
    ],
    [
      'missing explicit week',
      (programme: LongitudinalOdinProgramme) => {
        programme.phases[0]!.weeks.pop();
      },
    ],
    [
      'invalid cycle length',
      (programme: LongitudinalOdinProgramme) => {
        programme.calendar.cycle_length_days = 8;
      },
    ],
    [
      'rest day with resistance exercise',
      (programme: LongitudinalOdinProgramme) => {
        programme.phases[0]!.weeks[0]!.days[2]!.exercises =
          programme.phases[0]!.weeks[0]!.days[0]!.exercises;
      },
    ],
    [
      'duplicate exercise display order',
      (programme: LongitudinalOdinProgramme) => {
        const day = programme.phases[0]!.weeks[0]!.days[0]!;
        day.exercises.push({
          ...day.exercises[0]!,
          prescription_id: 'duplicate-prescription',
          exercise_id: 'duplicate-exercise',
        });
      },
    ],
    [
      'invalid RPE ceiling',
      (programme: LongitudinalOdinProgramme) => {
        const set =
          programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.sets[0]!;
        set.target_rpe = 9;
        set.rpe_ceiling = 8;
      },
    ],
    [
      'planned deload not typed deload',
      (programme: LongitudinalOdinProgramme) => {
        programme.fatigue_management_policy.strategy = 'planned_deload';
        programme.fatigue_management_policy.planned_deload_weeks = [4];
        programme.phases[0]!.weeks[3]!.week_type = 'loading';
      },
    ],
    [
      'none fatigue strategy with planned deload',
      (programme: LongitudinalOdinProgramme) => {
        programme.fatigue_management_policy.strategy = 'none';
        programme.fatigue_management_policy.planned_deload_weeks = [4];
        programme.phases[0]!.weeks[3]!.week_type = 'deload';
      },
    ],
  ])('rejects %s', (_name, mutate) => {
    const programme = clone();
    mutate(programme);
    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('requires exact set reps, RPE and rest fields', () => {
    const programme = clone();
    const set = programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.sets[0]!;
    delete (set as { target_reps?: number }).target_reps;
    delete (set as { target_rpe?: number }).target_rpe;
    delete (set as { rest_seconds?: number }).rest_seconds;

    expect(LongitudinalOdinProgrammeSchema.safeParse(programme).success).toBe(
      false,
    );
  });

  it('validates interval and steady-state conditioning structures', () => {
    const intervalProgramme = clone();
    const item =
      intervalProgramme.phases[0]!.weeks[0]!.days[1]!.conditioning[0]!;
    item.conditioning_type = 'intervals';
    item.intervals = {
      work_seconds: 60,
      recovery_seconds: 60,
      interval_count: 8,
      work_intensity: {
        method: 'session_rpe',
        target_min: 8,
        target_max: 8,
      },
      recovery_intensity: {
        method: 'session_rpe',
        target_min: 2,
        target_max: 2,
      },
    };
    expect(
      LongitudinalOdinProgrammeSchema.safeParse(intervalProgramme).success,
    ).toBe(true);

    delete item.intervals;
    expect(
      LongitudinalOdinProgrammeSchema.safeParse(intervalProgramme).success,
    ).toBe(false);

    const steady = clone();
    steady.phases[0]!.weeks[0]!.days[1]!.conditioning[0]!.intervals = {
      work_seconds: 60,
      recovery_seconds: 60,
      interval_count: 8,
      work_intensity: {
        method: 'session_rpe',
        target_min: 8,
        target_max: 8,
      },
      recovery_intensity: {
        method: 'session_rpe',
        target_min: 2,
        target_max: 2,
      },
    };
    expect(LongitudinalOdinProgrammeSchema.safeParse(steady).success).toBe(
      false,
    );
  });

  it('makes the compatibility projection explicit', () => {
    const projected = toLegacyProgramme(validLongitudinalProgramme, {
      available_days: 3,
      equipment: 'full_gym',
    });

    expect(projected.phase_week_templates).toHaveLength(1);
    expect(projected.phase_week_templates[0]!.days).toHaveLength(7);
    expect(projected.assumptions.at(-1)).toContain('Compatibility projection');
    expect(projected.validation_summary.warnings.at(-1)?.code).toBe(
      'V2_COMPATIBILITY_PROJECTION',
    );
  });
});
