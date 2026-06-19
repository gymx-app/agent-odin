import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../../fixtures/programmes/valid-longitudinal-programme.js';
import type { Exercise } from '../../../src/domain/exercise/exercise.types.js';
import { seedExercises } from '../../../src/exercises/approved-exercise-library.js';
import { sequenceSessionExercises } from '../../../src/planning/sequencing/exercise-sequencer.js';
import { evaluateSequenceConstraints } from '../../../src/planning/sequencing/sequence-constraint-evaluator.js';
import type {
  ExercisePrescription,
  PlannedResistanceSession,
} from '../../../src/planning/sessions/session.types.js';
import type { PlannedWarmup } from '../../../src/planning/warmup/warmup.types.js';
import { createProfile } from '../test-planning-utils.js';

const approved = (id: string) =>
  seedExercises.find((exercise) => exercise.id === id)!;

const prescription = (
  id: string,
  role: ExercisePrescription['sequence_role'],
  priority: number,
): ExercisePrescription => {
  const exercise = approved(id);
  const base =
    validLongitudinalProgramme.phases[0]!.weeks[0]!.days[0]!.exercises[0]!;
  return {
    ...structuredClone(base),
    prescription_id: `test-${id}`,
    exercise_id: id,
    exercise_name: exercise.name,
    display_order: priority,
    sequence_role: role,
    priority,
    equipment: exercise.equipment,
    movement_patterns: exercise.movement_patterns,
    primary_muscles: exercise.primary_muscles,
    secondary_muscles: exercise.secondary_muscles,
    sequencing_rationale: [],
  };
};

const makeSession = (
  exercises: ExercisePrescription[],
  kind: NonNullable<
    PlannedResistanceSession['day']['session_metadata']
  >['session_kind'] = 'full_body',
): PlannedResistanceSession => {
  const day = structuredClone(
    validLongitudinalProgramme.phases[0]!.weeks[0]!.days[0]!,
  );
  return {
    day: {
      ...day,
      exercises,
      session_metadata: {
        ...day.session_metadata!,
        session_kind: kind,
        phase_objective:
          kind === 'specialized'
            ? 'Specialise the priority muscle.'
            : day.session_metadata!.phase_objective,
      },
    },
    week_type: 'loading',
    movement_slots: [],
    selected_exercise_ids: exercises.map((exercise) => exercise.exercise_id),
    rationale_codes: [],
    duration: {
      estimated_duration_min: 45,
      working_time_min: 10,
      rest_time_min: 20,
      setup_transition_min: 5,
      warmup_allowance_min: 5,
      cooldown_allowance_min: 5,
    },
  };
};

const warmup: PlannedWarmup = {
  items: [],
  duration_seconds: 300,
  rationale_codes: [],
  compressed_for_duration: false,
};

describe('Exercise Sequencer V2', () => {
  it('moves a priority pull before high grip-fatigue work', () => {
    const pull = prescription('pull_up', 'primary', 1);
    const curl = prescription('dumbbell_biceps_curl', 'isolation', 2);
    const carry = prescription('dumbbell_farmer_carry', 'accessory', 3);
    const result = sequenceSessionExercises({
      profile: createProfile(),
      session: makeSession([curl, carry, pull]),
      exercises: seedExercises,
      warmup,
    });

    expect(result.exercises[0]!.exercise_id).toBe('pull_up');
    expect(result.exercises.at(-1)!.sequence_role).toBe('isolation');
  });

  it('places selected power work before fatiguing strength work', () => {
    const squat = approved('barbell_back_squat');
    const powerExercise: Exercise = {
      ...squat,
      id: 'test_jump',
      name: 'Test Jump',
      fatigue_cost: { systemic: 1, local: 1, axial: 0, grip: 0 },
    };
    const power = {
      ...prescription('barbell_back_squat', 'power', 1),
      exercise_id: powerExercise.id,
      exercise_name: powerExercise.name,
    };
    const primary = prescription('barbell_deadlift', 'primary', 2);
    const result = sequenceSessionExercises({
      profile: createProfile(),
      session: makeSession([primary, power]),
      exercises: [...seedExercises, powerExercise],
      warmup,
    });

    expect(result.exercises.map((exercise) => exercise.exercise_id)).toEqual([
      'test_jump',
      'barbell_deadlift',
    ]);
    expect(result.exercises[0]!.sequencing_rationale).toContain(
      'POWER_EXERCISE_PLACED_FIRST',
    );

    const violations = evaluateSequenceConstraints(
      {
        profile: createProfile(),
        session: makeSession([primary, power]),
        exercises: [...seedExercises, powerExercise],
        warmup,
      },
      {
        candidate_id: 'reversed-power',
        prescriptions: [primary, power],
        exception_codes: [],
      },
    );
    expect(violations.map((violation) => violation.code)).toContain(
      'POWER_EXERCISE_AFTER_FATIGUING_WORK',
    );
  });

  it('detects grip, lower-back and core fatigue dependencies', () => {
    const pull = prescription('pull_up', 'primary', 1);
    const carry = prescription('dumbbell_farmer_carry', 'accessory', 2);
    const row = prescription('one_arm_dumbbell_row', 'primary', 1);
    const deadlift = prescription('barbell_deadlift', 'secondary', 2);
    const squat = prescription('barbell_back_squat', 'primary', 1);
    const core = prescription('front_plank', 'core', 2);
    const frontPlank = approved('front_plank');
    const fatiguingCore: Exercise = {
      ...frontPlank,
      fatigue_cost: { ...frontPlank.fatigue_cost, local: 5 },
    };
    const cases = [
      {
        code: 'GRIP_FATIGUE_SEQUENCE_CONFLICT',
        prescriptions: [carry, pull],
        library: seedExercises,
      },
      {
        code: 'LOWER_BACK_FATIGUE_SEQUENCE_CONFLICT',
        prescriptions: [deadlift, row],
        library: seedExercises,
      },
      {
        code: 'CORE_FATIGUE_SEQUENCE_CONFLICT',
        prescriptions: [core, squat],
        library: seedExercises.map((exercise) =>
          exercise.id === fatiguingCore.id ? fatiguingCore : exercise,
        ),
      },
    ];

    cases.forEach(({ code, prescriptions, library }) => {
      const violations = evaluateSequenceConstraints(
        {
          profile: createProfile(),
          session: makeSession(prescriptions),
          exercises: library,
          warmup,
        },
        {
          candidate_id: `invalid-${code}`,
          prescriptions,
          exception_codes: [],
        },
      );
      expect(violations.map((violation) => violation.code)).toContain(code);
    });
  });

  it('supports an explicit specialisation-first isolation exception', () => {
    const isolation = prescription('dumbbell_lateral_raise', 'isolation', 1);
    const press = prescription('dumbbell_bench_press', 'primary', 2);
    const result = sequenceSessionExercises({
      profile: createProfile({ fitness_level: 'advanced' }),
      session: makeSession([press, isolation], 'specialized'),
      exercises: seedExercises,
      warmup,
    });

    expect(result.exercises[0]!.exercise_id).toBe('dumbbell_lateral_raise');
    expect(result.sequence_exceptions.map((item) => item.code)).toContain(
      'PRIORITY_ISOLATION_ADVANCED',
    );
  });

  it('requires an explicit advanced strategy before applying pre-exhaust', () => {
    const isolation = prescription('dumbbell_lateral_raise', 'isolation', 1);
    const press = prescription('dumbbell_bench_press', 'primary', 2);
    const session = makeSession([press, isolation]);
    session.day.session_metadata!.phase_objective =
      'Hypertrophy for the priority muscle.';
    session.strategy = {
      ...validLongitudinalProgramme.strategy,
      rationale: [
        {
          code: 'PRE_EXHAUST_SELECTED',
          selected_value: 'enabled',
          reason: 'Explicit advanced specialisation strategy.',
          source_fields: ['strategy'],
          confidence: 'high',
        },
      ],
    };
    const result = sequenceSessionExercises({
      profile: createProfile({
        fitness_level: 'advanced',
        training_history: {
          years_consistent_training: 6,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
        },
      }),
      session,
      exercises: seedExercises,
      warmup,
    });

    expect(result.exercises[0]!.exercise_id).toBe('dumbbell_lateral_raise');
    expect(result.sequence_exceptions.map((item) => item.code)).toContain(
      'PRE_EXHAUST_STRATEGY_APPLIED',
    );
  });

  it('is deterministic including rationale and transition estimates', () => {
    const input = {
      profile: createProfile(),
      session: makeSession([
        prescription('dumbbell_biceps_curl', 'isolation', 3),
        prescription('seated_cable_row', 'secondary', 2),
        prescription('dumbbell_bench_press', 'primary', 1),
      ]),
      exercises: seedExercises,
      warmup,
    };
    expect(sequenceSessionExercises(input)).toEqual(
      sequenceSessionExercises(input),
    );
  });
});
