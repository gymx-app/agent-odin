import type { ProgrammeDay, WeekPlannerInput } from '../weeks/week.types.js';
import { estimateMaximumSessionSets } from '../weeks/week-policies.js';
import { budgetMovementPatterns } from './movement-volume-budgeter.js';
import { budgetMuscleGroups } from './muscle-volume-budgeter.js';

const baseWeeklySets = (input: WeekPlannerInput): number => {
  const status = input.profile.athlete_state.training_status.value;
  const fillRate = status === 'advanced' ? 0.92 : status === 'intermediate' ? 0.85 : 0.75;
  const maxPerSession = estimateMaximumSessionSets(
    input.profile.source.session_duration_min,
  );
  const perSession = Math.max(
    status === 'advanced' ? 12 : status === 'intermediate' ? 10 : 8,
    Math.round(maxPerSession * fillRate),
  );
  return perSession * input.strategy.resistance_frequency;
};

export const allocateWeeklyVolume = (
  input: WeekPlannerInput,
  volumeFactor: number,
): {
  total_working_sets: number;
  muscle_group_budgets: ReturnType<typeof budgetMuscleGroups>;
  movement_pattern_budgets: ReturnType<typeof budgetMovementPatterns>;
  session_set_budgets: Map<number, number>;
  rationale_codes: string[];
} => {
  const resistanceDays = input.calendar.days.filter(
    (day) => day.planned_session_type === 'resistance',
  );
  const maximumPerSession = estimateMaximumSessionSets(
    input.profile.source.session_duration_min,
  );
  const capacity = maximumPerSession * resistanceDays.length;
  const desired = Math.round(baseWeeklySets(input) * volumeFactor);
  const total_working_sets = Math.min(desired, capacity);
  const session_set_budgets = new Map<number, number>();
  let remaining = total_working_sets;
  resistanceDays.forEach((day, index) => {
    const sessionsLeft = resistanceDays.length - index;
    const target = Math.min(
      maximumPerSession,
      Math.ceil(remaining / sessionsLeft),
    );
    session_set_budgets.set(day.cycle_day, target);
    remaining -= target;
  });
  const rationale_codes = [
    ...(input.profile.source.training_history?.recent_weekly_sets_by_muscle
      ? ['RECENT_VOLUME_ANCHORED']
      : ['RECENT_VOLUME_UNKNOWN_CONSERVATIVE_START']),
    ...(desired > capacity ? ['SESSION_DURATION_VOLUME_REDUCED'] : []),
    ...((input.profile.source.sport?.sessions_per_week ?? 0) >= 2
      ? ['SPORT_LOAD_VOLUME_REDUCED']
      : []),
  ];

  return {
    total_working_sets,
    muscle_group_budgets: budgetMuscleGroups(input, volumeFactor),
    movement_pattern_budgets: budgetMovementPatterns(input, total_working_sets),
    session_set_budgets,
    rationale_codes,
  };
};

export const sessionBudgetDuration = (workingSets: number): number =>
  Math.ceil(13 + workingSets * 3.5);

export const emptyBudgetForDay = (
  day: WeekPlannerInput['calendar']['days'][number],
): ProgrammeDay['training_budget'] =>
  day.planned_session_type === 'rest' || day.planned_session_type === 'sport'
    ? undefined
    : {
        total_working_set_budget: 0,
        muscle_group_budgets: {},
        movement_pattern_budgets: {},
        intensity_intent: 'light',
        effort_target: 5,
        rpe_ceiling: 6,
        fatigue_ceiling: 'low',
        estimated_duration_min: 0,
        rationale_codes: [],
      };
