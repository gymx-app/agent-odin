// Shared with phase-planner.ts's phase-transition deload and the readiness
// evaluator's data-triggered deload — same real-world adjustment, whether
// it's scheduled ahead of time or triggered early by observed fatigue.
export const PHASE_DELOAD_ADJUSTMENTS = {
  volume_factor: 0.7,
  intensity_factor: 0.85,
  effort_factor: 0.8,
  conditioning_factor: 0.8,
} as const;
