import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { CompoundExerciseId, KnownLift, BaselinePath } from '../domain/athlete/athlete-input-v2.schema.js';
import { percentOneRepMaxForRpeReps } from './evidence.js';

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
// Maps goal type to % of estimated 1RM for the working weight. Used as a
// fallback when a set's target RPE/reps fall outside the RPE_PERCENT_1RM_TABLE
// range (see evidence.ts) — otherwise every set uses that table instead, so
// weight tracks the RPE-based intensity progression each phase already
// computes rather than staying flat across the whole programme.
// Rounded to nearest 2.5 kg (standard plate increment).
const WORKING_WEIGHT_PCT: Record<string, number> = {
  strength: 0.825,       // midpoint of ≥80% range
  muscle_gain: 0.725,    // midpoint of 60–85% range
  fat_loss: 0.65,        // midpoint of 60–70% range
  recomposition: 0.70,
  endurance: 0.65,
  general_fitness: 0.65,
};

const roundToPlate = (weight_kg: number): number =>
  Math.round(weight_kg / 2.5) * 2.5;

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
  return roundToPlate(estimated_1rm_kg * pct);
};

// A set's target RPE and target reps, via the RPE_PERCENT_1RM_TABLE, take
// priority over the flat goal-based percentage — this is what lets load
// actually climb through Accumulation → Intensification → Realization as
// each phase's RPE targets increase, instead of staying at one static
// number for the whole programme.
const workingWeightForSet = (
  estimated_1rm_kg: number,
  goal_type: string,
  set: { target_rpe: number; target_reps: number } | undefined,
): number => {
  const rpeBasedPct = set
    ? percentOneRepMaxForRpeReps(set.target_rpe, set.target_reps)
    : undefined;
  return rpeBasedPct !== undefined
    ? roundToPlate(estimated_1rm_kg * (rpeBasedPct / 100))
    : calculateWorkingWeight(estimated_1rm_kg, goal_type);
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

  // Build a flat map: library_exercise_id → estimated 1RM (kg). The
  // working weight for each occurrence of that exercise is computed fresh
  // below, from that specific occurrence's prescribed RPE/reps.
  const estimated1rmByExerciseId = new Map<string, number>();
  for (const lift of lifts) {
    const estimated1rm = estimateOneRepMax(lift.weight_kg, lift.reps);
    const libraryIds = COMPOUND_TO_LIBRARY_IDS[lift.exercise_id as CompoundExerciseId];
    if (libraryIds) {
      for (const id of libraryIds) {
        estimated1rmByExerciseId.set(id, estimated1rm);
      }
    }
  }

  return phases.map((phase) => ({
    ...phase,
    weeks: phase.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => ({
        ...day,
        exercises: day.exercises.map((ex) => {
          const estimated1rm = estimated1rmByExerciseId.get(ex.exercise_id);
          if (estimated1rm === undefined) {
            return { ...ex, weight_kg: null };
          }
          const workingSet =
            ex.sets?.find((set) => set.set_type === 'working') ?? ex.sets?.[0];
          return {
            ...ex,
            weight_kg: workingWeightForSet(estimated1rm, athlete.goal, workingSet),
          };
        }),
      })),
    })),
  }));
};
