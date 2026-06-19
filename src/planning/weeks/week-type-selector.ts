import type { PhaseArchitecture } from '../phases/phase.types.js';
import type { WeekPlannerInput } from './week.types.js';

export const selectWeekType = (
  input: WeekPlannerInput,
  phase: PhaseArchitecture,
  weekNumber: number,
  phaseWeekIndex: number,
):
  | 'introduction'
  | 'loading'
  | 'overload'
  | 'deload'
  | 'testing'
  | 'maintenance' => {
  if (input.planned_deload_weeks.includes(weekNumber)) return 'deload';
  if (phase.phase_type === 'recovery') return 'maintenance';
  if (phase.phase_type === 'maintenance') return 'maintenance';
  if (phase.phase_type === 'realization') {
    return input.profile.source.sport?.competition_date
      ? 'testing'
      : 'maintenance';
  }
  if (
    weekNumber === 1 ||
    phaseWeekIndex === 0 ||
    input.profile.athlete_state.training_status.value === 'returning'
  ) {
    return 'introduction';
  }
  const advanced =
    input.profile.athlete_state.training_status.value === 'advanced';
  const finalPhaseWeek = phaseWeekIndex === phase.weeks_count - 1;
  if (
    advanced &&
    finalPhaseWeek &&
    input.profile.recovery_capacity !== 'low' &&
    phase.phase_type === 'accumulation'
  ) {
    return 'overload';
  }
  return 'loading';
};
