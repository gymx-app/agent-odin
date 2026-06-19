import type { PhaseArchitecture, PhasePlannerInput } from './phase.types.js';

export const selectPlannedDeloadWeeks = (
  input: PhasePlannerInput,
  phases: PhaseArchitecture[],
): number[] => {
  if (
    input.strategy.fatigue_strategy !== 'planned_deload' &&
    input.strategy.fatigue_strategy !== 'combined'
  ) {
    return [];
  }

  const recoveryWeeks = phases
    .filter((phase) => phase.phase_type === 'recovery')
    .map((phase) => phase.start_week);
  if (recoveryWeeks.length > 0) return recoveryWeeks;

  const transition = phases
    .slice(1)
    .find((phase) => phase.phase_type === 'intensification');
  return transition && transition.start_week > 3
    ? [transition.start_week - 1]
    : [];
};
