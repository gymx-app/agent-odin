import {
  getNextTargetReps,
  shouldIncreaseLoad,
} from '../progression-policy.js';

export type CompletedSet = {
  target_reps: number;
  rpe_ceiling: number;
  reps_achieved: number;
  rpe_reported: number;
};

export type ProgressionBounds = {
  rep_min: number;
  rep_max: number;
};

export type NextPrescription = {
  next_target_reps: number;
  increase_load: boolean;
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

  const increaseLoad = shouldIncreaseLoad(
    completedAtOrBelowCeiling,
    currentTargetReps,
    bounds.rep_max,
  );

  if (increaseLoad) {
    return {
      next_target_reps: bounds.rep_min,
      increase_load: true,
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
