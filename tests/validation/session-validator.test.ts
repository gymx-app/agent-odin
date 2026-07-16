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

  it('flags drop sets/rest-pause assigned to a primary compound lift', () => {
    const programme = clone();
    const prescription = programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!;
    prescription.set_structure = {
      type: 'drop_set',
      drop_set_detail: { drop_count: 2, load_drop_pct: 20 },
      rationale_codes: ['TIME_CONSTRAINED_SESSION'],
    };
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('UNSAFE_SET_STRUCTURE_ON_COMPOUND_LIFT');
  });

  it('flags cluster sets used off their intended compound-strength target', () => {
    const programme = clone();
    const prescription = programme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!;
    prescription.sequence_role = 'isolation';
    prescription.set_structure = {
      type: 'cluster',
      cluster_detail: { intra_set_rest_seconds: 20 },
      rationale_codes: ['VELOCITY_PRESERVATION'],
    };
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('CLUSTER_SET_OFF_TARGET_USE');
  });

  it('flags a superset that groups in a primary compound lift', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    const first = day.exercises[0]!;
    first.set_structure = { type: 'superset', rationale_codes: ['TIME_EFFICIENCY'] };
    first.superset_group_id = 'group-1';
    day.exercises.push({
      ...structuredClone(first),
      prescription_id: 'second-in-group',
      exercise_id: 'dumbbell_lateral_raise',
      display_order: 2,
    });
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('SUPERSET_ON_PRIMARY_STRENGTH_LIFT');
  });

  it('flags a superset group whose members disagree on set_structure.type', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    const first = day.exercises[0]!;
    first.sequence_role = 'isolation';
    first.set_structure = { type: 'superset', rationale_codes: ['TIME_EFFICIENCY'] };
    first.superset_group_id = 'group-1';
    day.exercises.push({
      ...structuredClone(first),
      prescription_id: 'second-in-group',
      exercise_id: 'dumbbell_lateral_raise',
      display_order: 2,
      set_structure: { type: 'straight', rationale_codes: [] },
    });
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('SUPERSET_GROUP_TYPE_MISMATCH');
  });

  it('flags true-failure exposure when policy is "none"', () => {
    const programme = clone();
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    day.exercises[0]!.sets[0]!.rpe_ceiling = 10;
    expect(
      validateLongitudinalSessions(
        programme,
        createProfile(),
        seedExercises,
      ).map((finding) => finding.code),
    ).toContain('UNSAFE_FAILURE_EXPOSURE');
  });

  it('flags true-failure exposure on an exercise with an active movement restriction', () => {
    const programme = clone();
    const profile = createProfile({
      injuries: [
        { area: 'knee', severity: 'modify', notes: 'Use a supported range.' },
      ],
    });
    const day = programme.phases[0]!.weeks[0]!.days[0]!;
    day.exercises[0]!.modification_metadata = {
      required: true,
      cues: [],
      restriction_tags: ['loaded_deep_knee_flexion'],
    };
    day.exercises[0]!.sets[0]!.rpe_ceiling = 10;
    expect(
      validateLongitudinalSessions(programme, profile, seedExercises).map(
        (finding) => finding.code,
      ),
    ).toContain('UNSAFE_FAILURE_EXPOSURE');
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
