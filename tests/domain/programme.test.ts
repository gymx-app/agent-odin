import { describe, expect, it } from 'vitest';
import { OdinProgrammeSchema } from '../../src/domain/programme/programme.schema.js';
import type { OdinProgramme } from '../../src/domain/programme/programme.types.js';
import {
  minimalValidOdinProgramme,
  validProgrammeFixtures,
} from '../../fixtures/programmes/valid-programmes.js';

const clone = <T>(value: T): T => structuredClone(value);

describe('OdinProgrammeSchema', () => {
  it.each(validProgrammeFixtures)(
    'accepts valid programme fixtures',
    (fixture) => {
      expect(OdinProgrammeSchema.safeParse(fixture).success).toBe(true);
    },
  );

  it('supports inferred OdinProgramme type', () => {
    const programme: OdinProgramme = minimalValidOdinProgramme;
    expect(programme.config.total_phases).toBe(1);
  });

  it.each([
    [
      'rep_max lower than rep_min',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[0]!.exercises[0]!.rep_max = 7;
      },
    ],
    [
      'RPE target above RPE ceiling',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[0]!.exercises[0]!.rpe_target = 9;
        p.phase_week_templates[0]!.days[0]!.exercises[0]!.rpe_ceiling = 8;
      },
    ],
    [
      'rest max lower than min',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[0]!.exercises[0]!.rest_seconds_max = 30;
      },
    ],
    [
      'invalid seven-day template',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days.pop();
      },
    ],
    [
      'duplicate day in template',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[1]!.day_of_week = 'MON';
      },
    ],
    [
      'workout day without exercises',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[0]!.exercises = [];
      },
    ],
    [
      'LISS day containing exercises',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[1]!.exercises = [
          p.phase_week_templates[0]!.days[0]!.exercises[0]!,
        ];
      },
    ],
    [
      'rest day containing liss_content',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[3]!.liss_content = 'Not allowed.';
      },
    ],
    [
      'mismatched total phases phase_weeks',
      (p: OdinProgramme) => {
        p.config.total_phases = 2;
      },
    ],
    [
      'mismatched total phases phases',
      (p: OdinProgramme) => {
        p.config.phase_weeks = [4, 4];
        p.config.total_phases = 2;
      },
    ],
    [
      'duplicate phase numbers',
      (p: OdinProgramme) => {
        p.config.phase_weeks = [4, 4];
        p.config.total_phases = 2;
        p.phases.push({ ...p.phases[0]! });
        p.phase_week_templates.push({
          ...p.phase_week_templates[0]!,
          phase_number: 2,
        });
      },
    ],
    [
      'duplicate warmup display order',
      (p: OdinProgramme) => {
        p.warmup_items.push({ ...p.warmup_items[0]!, item_key: 'duplicate' });
      },
    ],
    [
      'duplicate exercise display order',
      (p: OdinProgramme) => {
        p.phase_week_templates[0]!.days[0]!.exercises.push({
          ...p.phase_week_templates[0]!.days[0]!.exercises[0]!,
          exercise_id: 'hinge',
        });
      },
    ],
  ])('rejects %s', (_name, mutate) => {
    const programme = clone(minimalValidOdinProgramme);
    mutate(programme);
    expect(OdinProgrammeSchema.safeParse(programme).success).toBe(false);
  });
});
