export const progressionPolicy = {
  model: 'double_progression',
  targetRepsProgress:
    'If all prescribed sets are completed at target reps and at or below the RPE ceiling, increase target reps by one next time.',
  topOfRange:
    'If the top progression bound is completed across all sets at or below the RPE ceiling, increase load next time and reset reps to the lower progression bound.',
  missedMinimum:
    'If minimum target reps cannot be completed without exceeding the RPE ceiling, maintain or reduce load.',
  loadPrescription:
    'No specific weight increase is prescribed in the baseline programme.',
} as const;

export const getNextTargetReps = (
  completedAtOrBelowCeiling: boolean,
  currentTargetReps: number,
  progressionMax: number,
): number => {
  if (!completedAtOrBelowCeiling) {
    return currentTargetReps;
  }

  return Math.min(currentTargetReps + 1, progressionMax);
};

export const shouldIncreaseLoad = (
  completedAtOrBelowCeiling: boolean,
  currentTargetReps: number,
  progressionMax: number,
): boolean => completedAtOrBelowCeiling && currentTargetReps >= progressionMax;
