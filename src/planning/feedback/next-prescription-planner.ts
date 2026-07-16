import {
  getNextTargetReps,
  shouldIncreaseLoad,
} from '../progression-policy.js';
import { PLATE_INCREMENT_KG } from '../weight-prescription.js';

export type CompletedSet = {
  target_reps: number;
  rpe_ceiling: number;
  reps_achieved: number;
  rpe_reported: number;
};

export type ProgressionBounds = {
  rep_min: number;
  rep_max: number;
  // Mirrors ExercisePrescription.progression_bounds.load_increment_type.
  // 'none' means an active movement restriction (or bodyweight-only
  // equipment) already pinned this exercise to reps/ROM-only progression
  // at prescription time — load must never advance while that holds.
  load_increment_type?:
    | 'absolute'
    | 'percentage'
    | 'smallest_available'
    | 'none'
    | undefined;
  // The exercise's current known weight (self-reported or baseline-
  // estimated) — undefined when no basis exists (weight_kg was null).
  // Without this, "increase load" is a flag the caller can't act on.
  current_weight_kg?: number | undefined;
};

export type NextPrescription = {
  next_target_reps: number;
  increase_load: boolean;
  // odin-programme-design-logic.md, Section 4: "load is the target
  // variable" needs an actual number, not just a flag. Only present when
  // increase_load is true and current_weight_kg was known — otherwise
  // there's nothing to increment from, and the caller should not present
  // a fabricated number.
  next_target_weight_kg?: number;
  rationale_codes: string[];
};

const metAllSetsAtOrBelowCeiling = (sets: CompletedSet[]): boolean =>
  sets.every(
    (set) =>
      set.reps_achieved >= set.target_reps &&
      set.rpe_reported <= set.rpe_ceiling,
  );

// Wires the double-progression model already defined in progression-policy.ts
// (previously written but never called from anywhere): completing all sets
// at target reps and at-or-below the RPE ceiling advances reps by one, up to
// the top of the prescribed range, then the next completion at the top
// resets reps to the bottom and calls for a load increase instead.
export const planNextPrescription = (
  completedSets: CompletedSet[],
  currentTargetReps: number,
  bounds: ProgressionBounds,
): NextPrescription => {
  const completedAtOrBelowCeiling = metAllSetsAtOrBelowCeiling(completedSets);

  if (!completedAtOrBelowCeiling) {
    return {
      next_target_reps: currentTargetReps,
      increase_load: false,
      rationale_codes: ['PRESCRIPTION_HELD_TARGET_NOT_MET'],
    };
  }

  const loadProgressionSuppressed = bounds.load_increment_type === 'none';

  const increaseLoad =
    !loadProgressionSuppressed &&
    shouldIncreaseLoad(completedAtOrBelowCeiling, currentTargetReps, bounds.rep_max);

  if (loadProgressionSuppressed && currentTargetReps >= bounds.rep_max) {
    return {
      next_target_reps: bounds.rep_max,
      increase_load: false,
      rationale_codes: ['LOAD_PROGRESSION_SUPPRESSED_REPS_HELD'],
    };
  }

  if (increaseLoad) {
    return {
      next_target_reps: bounds.rep_min,
      increase_load: true,
      ...(bounds.current_weight_kg !== undefined
        ? {
            next_target_weight_kg:
              bounds.current_weight_kg + PLATE_INCREMENT_KG,
          }
        : {}),
      rationale_codes: ['TOP_OF_RANGE_REACHED_LOAD_INCREASED'],
    };
  }

  return {
    next_target_reps: getNextTargetReps(
      completedAtOrBelowCeiling,
      currentTargetReps,
      bounds.rep_max,
    ),
    increase_load: false,
    rationale_codes: ['TARGET_REPS_PROGRESSED'],
  };
};
