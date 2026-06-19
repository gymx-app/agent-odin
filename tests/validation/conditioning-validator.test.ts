import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { validateLongitudinalConditioning } from '../../src/validation/conditioning-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('Conditioning Validator V2', () => {
  it('accepts the valid longitudinal conditioning fixture', () => {
    expect(validateLongitudinalConditioning(clone(), createProfile())).toEqual(
      [],
    );
  });

  it('rejects an excluded modality', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[1]!.conditioning[0]!.activity_id =
      'running';
    expect(
      validateLongitudinalConditioning(
        programme,
        createProfile({
          movement_restrictions: [
            {
              region: 'lower_body',
              movement_demand: 'high_impact',
              tolerance: 'excluded',
            },
          ],
        }),
      ).map((finding) => finding.code),
    ).toContain('CONDITIONING_MODALITY_EXCLUDED');
  });

  it('rejects unsupported resistance-priority ordering', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[1]!;
    day.conditioning[0]!.conditioning_type = 'intervals';
    day.conditioning[0]!.placement = 'before_resistance';
    day.conditioning[0]!.intervals = {
      work_seconds: 60,
      recovery_seconds: 120,
      interval_count: 6,
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
      validateLongitudinalConditioning(programme, createProfile()).map(
        (finding) => finding.code,
      ),
    ).toContain('CONDITIONING_BEFORE_PRIORITY_RESISTANCE');
  });

  it('reports unacceptable interference and missing rationale', () => {
    const programme = clone();
    const item = programme.phases[0]!.weeks[0]!.days[1]!.conditioning[0]!;
    item.interference_risk = 'unacceptable';
    item.rationale = [];
    const codes = validateLongitudinalConditioning(
      programme,
      createProfile(),
    ).map((finding) => finding.code);
    expect(codes).toContain('UNACCEPTABLE_CONCURRENT_TRAINING_INTERFERENCE');
    expect(codes).toContain('CONDITIONING_RATIONALE_MISSING');
  });

  it('rejects simultaneous duration and intensity progression', () => {
    const programme = clone();
    const first = programme.phases[0]!.weeks[0]!.days[1]!.conditioning[0]!;
    const second = programme.phases[0]!.weeks[1]!.days[1]!.conditioning[0]!;
    first.duration_min = 20;
    first.intensity = { method: 'session_rpe', target_min: 3, target_max: 3 };
    second.duration_min = 30;
    second.intensity = {
      method: 'session_rpe',
      target_min: 5,
      target_max: 5,
    };
    expect(
      validateLongitudinalConditioning(programme, createProfile()).map(
        (finding) => finding.code,
      ),
    ).toContain('CONDITIONING_PROGRESSION_EXCESSIVE');
  });
});
