import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { validateLongitudinalExerciseSequences } from '../../src/validation/exercise-sequence-validator.js';
import { validateLongitudinalWarmups } from '../../src/validation/warmup-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('warm-up and sequence validation', () => {
  it('accepts the deterministic longitudinal fixture', () => {
    expect(validateLongitudinalWarmups(clone(), createProfile())).toEqual([]);
    expect(
      validateLongitudinalExerciseSequences(clone(), seedExercises),
    ).toEqual([]);
  });

  it('rejects missing exercise-specific ramp-up preparation', () => {
    const programme = clone();
    programme.phases[0]!.weeks[0]!.days[0]!.warmup =
      programme.phases[0]!.weeks[0]!.days[0]!.warmup.filter(
        (item) => item.component_type !== 'ramp_up_set',
      );
    expect(
      validateLongitudinalWarmups(programme, createProfile()).map(
        (finding) => finding.code,
      ),
    ).toContain('RAMP_UP_SETS_MISSING');
  });

  it('rejects invalid display order and missing rationale', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    const duplicate = structuredClone(day.exercises[0]!);
    duplicate.prescription_id = 'duplicate-order';
    duplicate.exercise_id = 'bodyweight_squat';
    duplicate.exercise_name = 'Bodyweight Squat';
    duplicate.sequencing_rationale = [];
    day.exercises.push(duplicate);
    const codes = validateLongitudinalExerciseSequences(
      programme,
      seedExercises,
    ).map((finding) => finding.code);
    expect(codes).toContain('DUPLICATE_EXERCISE_DISPLAY_ORDER');
    expect(codes).toContain('SEQUENCE_RATIONALE_MISSING');
  });

  it('rejects prolonged stretching immediately before selected power work', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    day.exercises[0]!.sequence_role = 'power';
    day.warmup.push({
      warmup_id: 'long-static-stretch',
      display_order: 4,
      component_type: 'targeted_mobility',
      activity_name: 'Long Static Stretch',
      duration_seconds: 90,
      purpose: 'Test invalid power preparation.',
      rationale_codes: [],
    });
    expect(
      validateLongitudinalWarmups(programme, createProfile()).map(
        (finding) => finding.code,
      ),
    ).toContain('STATIC_STRETCH_CONFLICT');
  });
});
