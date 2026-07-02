import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import {
  COMPOUND_EXERCISE_IDS,
  type CompoundExerciseId,
} from '../../domain/athlete/athlete-input-v2.schema.js';
import { COMPOUND_TO_LIBRARY_IDS } from '../weight-prescription.js';

// Design note: this is deliberately NOT inserted into
// programme.phases[].weeks[].days[] — that array has strict validated
// invariants (exactly 7 days/week, cycle_day 1-7 consecutive, day_of_week
// matching the calendar) that programmeValidationService enforces and
// repairs against. A synthetic "day 0" doesn't fit that weekly-cycle model
// and would likely be rejected or stripped during validation/repair.
// Instead this returns a self-contained object that the route attaches to
// the response as a sibling of `programme`, ordered before it.

export type BaselineSessionSet = {
  set_number: 1 | 2 | 3;
  reps: number;
  rpe: number;
  weight_kg: null;
  instruction: string;
};

export type BaselineSessionExercise = {
  compound_id: CompoundExerciseId;
  exercise_id: string;
  exercise_name: string;
  sets: BaselineSessionSet[];
};

export type BaselineWarmupItem = {
  activity_name: string;
  duration_seconds: number;
  purpose: string;
};

export type BaselineSession = {
  session_type: 'baseline_assessment';
  day_label: string;
  is_baseline: true;
  scheduled_before: 'week_1_day_1';
  exercises: BaselineSessionExercise[];
  warmup: BaselineWarmupItem[];
  cooldown: [];
};

const EXERCISE_NAMES: Record<CompoundExerciseId, string> = {
  squat: 'Barbell Back Squat',
  bench_press: 'Barbell Bench Press',
  deadlift: 'Barbell Deadlift',
  overhead_press: 'Barbell Overhead Press',
  barbell_row: 'Barbell Bent-Over Row',
};

// "Main work" — excludes accessory/isolation/core roles, per the phase
// prompt's own sequencing taxonomy (power → primary → secondary →
// accessory → isolation → core).
const MAIN_WORK_SEQUENCE_ROLES = new Set(['power', 'primary', 'secondary']);

const libraryIdToCompoundId = new Map<string, CompoundExerciseId>(
  COMPOUND_EXERCISE_IDS.flatMap((compoundId) =>
    COMPOUND_TO_LIBRARY_IDS[compoundId].map(
      (libraryId): [string, CompoundExerciseId] => [libraryId, compoundId],
    ),
  ),
);

const findCompoundLiftsInProgramme = (
  programme: LongitudinalOdinProgramme,
): CompoundExerciseId[] => {
  const found = new Set<CompoundExerciseId>();

  for (const phase of programme.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        for (const exercise of day.exercises ?? []) {
          if (!MAIN_WORK_SEQUENCE_ROLES.has(exercise.sequence_role)) continue;
          const compoundId = libraryIdToCompoundId.get(exercise.exercise_id);
          if (compoundId) found.add(compoundId);
        }
      }
    }
  }

  return [...found];
};

const buildBaselineExercise = (
  compoundId: CompoundExerciseId,
): BaselineSessionExercise => ({
  compound_id: compoundId,
  exercise_id: COMPOUND_TO_LIBRARY_IDS[compoundId][0]!,
  exercise_name: EXERCISE_NAMES[compoundId],
  sets: [
    {
      set_number: 1,
      reps: 10,
      rpe: 4,
      weight_kg: null,
      instruction: 'Light warmup — empty bar × 10 reps. Focus on technique. Stop before any fatigue.',
    },
    {
      set_number: 2,
      reps: 5,
      rpe: 5,
      weight_kg: null,
      instruction: 'Add moderate weight. 5 reps — should feel easy.',
    },
    {
      set_number: 3,
      reps: 5,
      rpe: 8,
      weight_kg: null,
      instruction:
        'Pick a weight you could do for 7 reps. Stop at 5. Log the weight — Odin uses it to calculate your training weights from Day 2 onwards.',
    },
  ],
});

// Returns null when the programme contains no compound lifts to test
// (e.g. a bodyweight-only programme) — day_one_test is invalid for
// equipment: 'bodyweight' per AthleteInputV2Schema's superRefine, but a
// dumbbell-only or home-gym programme could still legitimately have zero
// of the five barbell compounds.
export const buildDayZeroBaselineSession = (
  programme: LongitudinalOdinProgramme,
): BaselineSession | null => {
  const compoundLifts = findCompoundLiftsInProgramme(programme);
  if (compoundLifts.length === 0) return null;

  return {
    session_type: 'baseline_assessment',
    day_label: 'Day 0 — Strength Baseline',
    is_baseline: true,
    scheduled_before: 'week_1_day_1',
    exercises: compoundLifts.map(buildBaselineExercise),
    warmup: [
      {
        activity_name: 'Light Cardio (bike or brisk walk)',
        duration_seconds: 180,
        purpose: 'Raise body temperature before testing.',
      },
      {
        activity_name: 'Dynamic Mobility (leg swings, arm circles, bodyweight squats)',
        duration_seconds: 120,
        purpose: 'Prepare joints and muscles for the movements being tested today.',
      },
    ],
    cooldown: [],
  };
};
