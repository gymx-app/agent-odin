import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { validateLongitudinalSessions } from '../../src/validation/session-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('V2 session validator', () => {
  it('accepts valid fixture sessions', () => {
    expect(
      validateLongitudinalSessions(clone(), createProfile(), seedExercises),
    ).toEqual([]);
  });

  it.each([
    [
      'unknown exercise',
      'UNKNOWN_EXERCISE_ID',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.exercise_id =
          'unknown';
      },
    ],
    [
      'duplicate exercise',
      'DUPLICATE_EXERCISE_IN_SESSION',
      (programme: ReturnType<typeof clone>) => {
        const day = programme.phases[0]!.weeks[0]!.days[0]!;
        day.exercises.push({
          ...structuredClone(day.exercises[0]!),
          prescription_id: 'duplicate',
          display_order: 2,
        });
      },
    ],
    [
      'set budget mismatch',
      'WORKING_SET_BUDGET_MISMATCH',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.days[0]!.training_budget = {
          total_working_set_budget: 10,
          muscle_group_budgets: {},
          movement_pattern_budgets: {},
          intensity_intent: 'moderate',
          effort_target: 7,
          rpe_ceiling: 8,
          fatigue_ceiling: 'moderate',
          estimated_duration_min: 45,
          rationale_codes: [],
        };
      },
    ],
    [
      'non-canonical session name',
      'NON_CANONICAL_SESSION_NAME',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.days[0]!.title = 'Upper A';
      },
    ],
    [
      'non-canonical exercise name',
      'NON_CANONICAL_EXERCISE_NAME',
      (programme: ReturnType<typeof clone>) => {
        programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!.exercise_name =
          'Invented Squat';
      },
    ],
  ])('reports %s', (_name, code, mutate) => {
    const programme = clone();
    mutate(programme);
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain(code);
  });

  it('requires modification metadata for a modifiable exercise', () => {
    const programme = clone();
    const profile = createProfile({
      injuries: [
        { area: 'knee', severity: 'modify', notes: 'Use a supported range.' },
      ],
    });

    expect(
      validateLongitudinalSessions(programme, profile, seedExercises).map(
        (finding) => finding.code,
      ),
    ).toContain('MODIFICATION_METADATA_MISSING');
  });

  it('rejects invalid substitution IDs and excluded substitutes', () => {
    const programme = clone();
    const prescription = programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!;
    prescription.substitution_options = {
      approved_exercise_ids: ['unknown'],
      preserve: 'movement_pattern',
    };
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('SUBSTITUTION_GROUP_INVALID');

    prescription.substitution_options.approved_exercise_ids = [
      'bodyweight_squat',
    ];
    expect(
      validateLongitudinalSessions(
        programme,
        {
          ...createProfile(),
          excluded_exercise_ids: ['bodyweight_squat'],
        },
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('SUBSTITUTE_EXERCISE_EXCLUDED');
  });
});
