import type {
  WeekPlannerInput,
  WeekPlanningMetadata,
} from '../weeks/week.types.js';

export const selectMachineProgressionPolicy = (
  input: WeekPlannerInput,
): WeekPlanningMetadata['progression_policy'] => {
  const model = input.strategy.progression_model;
  const coarseLoading =
    input.profile.source.equipment === 'bodyweight' ||
    input.profile.source.equipment === 'dumbbells_only';
  const nextAction =
    model === 'linear_reps' || coarseLoading || model === 'double_progression'
      ? {
          type: 'increase_reps' as const,
          increment: 'one_rep' as const,
        }
      : model === 'maintenance'
        ? { type: 'hold' as const, increment: 'none' as const }
        : {
            type: 'increase_load' as const,
            increment: 'smallest_available' as const,
          };

  return {
    model,
    success_condition: {
      all_sets_completed: true,
      target_reps_met: true,
      maximum_rpe: 8,
    },
    next_action: nextAction,
    hold_condition: {
      target_reps_met: true,
      rpe_above_target: true,
    },
    regression_condition: {
      missed_reps: true,
      repeated_exposures: 2,
    },
  };
};
