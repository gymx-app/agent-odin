import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { CompoundExerciseId, KnownLift, BaselinePath } from '../domain/athlete/athlete-input-v2.schema.js';

// ── Epley 1985 ────────────────────────────────────────────────────────────────
// Estimates 1RM from a submaximal set.
// Valid only for reps 1–12; heavier extrapolation diverges from observed values.
export const estimateOneRepMax = (weight_kg: number, reps: number): number => {
  if (!Number.isInteger(reps) || reps < 1 || reps > 12) {
    throw new Error(`reps must be an integer between 1 and 12, got ${reps}`);
  }
  return weight_kg * (1 + reps / 30);
};

// ── ACSM 2026 ─────────────────────────────────────────────────────────────────
// Maps goal type to % of estimated 1RM for the working weight.
// Rounded to nearest 2.5 kg (standard plate increment).
const WORKING_WEIGHT_PCT: Record<string, number> = {
  strength: 0.825,       // midpoint of ≥80% range
  muscle_gain: 0.725,    // midpoint of 60–85% range
  fat_loss: 0.65,        // midpoint of 60–70% range
  recomposition: 0.70,
  endurance: 0.65,
  general_fitness: 0.65,
};

export const calculateWorkingWeight = (
  estimated_1rm_kg: number,
  goal_type: string,
): number => {
  const pct = WORKING_WEIGHT_PCT[goal_type];
  if (pct === undefined) {
    throw new Error(
      `Unknown goal_type: "${goal_type}". Expected one of: ${Object.keys(WORKING_WEIGHT_PCT).join(', ')}`,
    );
  }
  return Math.round((estimated_1rm_kg * pct) / 2.5) * 2.5;
};

// ── Compound lift → library exercise ID mapping ───────────────────────────────
// Each conceptual compound ID maps to the barbell library exercise IDs that
// share the same movement pattern and for which the reported 1RM is valid.
// Variants with significantly different biomechanics (e.g. front squat, sumo
// deadlift) are intentionally excluded — they receive weight_kg: null and
// use RPE anchoring like all other exercises.
export const COMPOUND_TO_LIBRARY_IDS: Record<CompoundExerciseId, readonly string[]> = {
  squat:          ['barbell_back_squat'],
  bench_press:    ['barbell_bench_press'],
  deadlift:       ['barbell_deadlift', 'trap_bar_deadlift'],
  overhead_press: ['barbell_overhead_press'],
  barbell_row:    ['barbell_bent_over_row', 'barbell_pendlay_row', 'tbar_row'],
};

// ── applyWeightPrescription ───────────────────────────────────────────────────

export const applyWeightPrescription = (
  phases: LongitudinalOdinProgramme['phases'],
  athlete: {
    baseline_path: BaselinePath;
    known_lifts: KnownLift[] | null;
    goal: string;
  },
): LongitudinalOdinProgramme['phases'] => {
  if (athlete.baseline_path !== 'self_reported') {
    // day_one_test and skipped — weight_kg stays null on every exercise
    return phases;
  }

  const lifts = athlete.known_lifts ?? [];
  if (lifts.length === 0) return phases;

  // Build a flat map: library_exercise_id → working_weight_kg
  const weightByExerciseId = new Map<string, number>();
  for (const lift of lifts) {
    const estimated1rm = estimateOneRepMax(lift.weight_kg, lift.reps);
    const workingWeight = calculateWorkingWeight(estimated1rm, athlete.goal);
    const libraryIds = COMPOUND_TO_LIBRARY_IDS[lift.exercise_id as CompoundExerciseId];
    if (libraryIds) {
      for (const id of libraryIds) {
        weightByExerciseId.set(id, workingWeight);
      }
    }
  }

  return phases.map((phase) => ({
    ...phase,
    weeks: phase.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => ({
          ...ex,
          weight_kg: weightByExerciseId.get(ex.exercise_id) ?? null,
        })),
      })),
    })),
  }));
};
