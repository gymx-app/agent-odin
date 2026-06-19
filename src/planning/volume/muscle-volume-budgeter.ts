import type { WeekPlannerInput } from '../weeks/week.types.js';
import { BASE_DIRECT_SETS, CORE_MUSCLE_GROUPS } from './volume-policies.js';

export const budgetMuscleGroups = (
  input: WeekPlannerInput,
  volumeFactor: number,
): Array<{
  muscle_group: string;
  direct_set_target: number;
  indirect_set_credit: number;
  minimum_effective_target: number;
  maximum_recoverable_target: number;
  priority: 'low' | 'moderate' | 'high';
  rationale_codes: string[];
}> => {
  const status = input.profile.athlete_state.training_status.value;
  const recent =
    input.profile.source.training_history?.recent_weekly_sets_by_muscle;
  const deficit = input.profile.source.nutrition?.calorie_status === 'deficit';
  const goal = input.strategy.primary_objective;

  return CORE_MUSCLE_GROUPS.map((muscle_group) => {
    const recentTarget = recent?.[muscle_group];
    let anchor = recentTarget ?? BASE_DIRECT_SETS[status];
    const priority =
      (goal === 'muscle_gain' || goal === 'recomposition') &&
      ['chest', 'lats', 'quadriceps', 'hamstrings', 'glutes'].includes(
        muscle_group,
      )
        ? ('high' as const)
        : ('moderate' as const);
    if (priority === 'high') anchor += 1;
    if (deficit) anchor = Math.min(anchor, 8);
    if (input.profile.recovery_capacity === 'low') anchor = Math.min(anchor, 6);
    const direct_set_target = Math.max(2, Math.round(anchor * volumeFactor));
    return {
      muscle_group,
      direct_set_target,
      indirect_set_credit: 0,
      minimum_effective_target: Math.max(2, direct_set_target - 2),
      maximum_recoverable_target: direct_set_target + 4,
      priority,
      rationale_codes: [
        recentTarget !== undefined
          ? 'RECENT_VOLUME_ANCHORED'
          : 'RECENT_VOLUME_UNKNOWN',
        ...(deficit ? ['DEFICIT_VOLUME_CONSTRAINED'] : []),
      ],
    };
  });
};
