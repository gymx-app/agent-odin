import {
  planFatigueBudget,
  deloadAdjustments,
} from '../fatigue/fatigue-budget-planner.js';
import { planIntensityTarget } from '../intensity/intensity-planner.js';
import { selectMachineProgressionPolicy } from '../progression/progression-policy-selector.js';
import {
  allocateWeeklyVolume,
  sessionBudgetDuration,
} from '../volume/weekly-volume-allocator.js';
import { planWeekFactors } from './week-factor-planner.js';
import { selectWeekType } from './week-type-selector.js';
import type {
  PlannedProgrammeWeek,
  ProgrammeDay,
  ProgrammeWeekPlanResult,
  WeekPlannerInput,
  WeekPlanningDecision,
} from './week.types.js';

const decision = (
  code: string,
  reason: string,
  confidence: 'low' | 'moderate' | 'high' = 'high',
): WeekPlanningDecision => ({
  code,
  selected_value: code,
  reason,
  source_fields: [
    'strategy',
    'calendar',
    'phases',
    'training_history',
    'athlete_state',
  ],
  confidence,
});

const distributeRecord = (
  values: Array<{ [key: string]: unknown }>,
  key: string,
  valueKey: string,
  sessions: number,
): Record<string, number> =>
  Object.fromEntries(
    values.map((item) => [
      String(item[key]),
      Math.max(0, Math.ceil(Number(item[valueKey]) / Math.max(1, sessions))),
    ]),
  );

const buildDay = (
  input: WeekPlannerInput,
  weekNumber: number,
  calendarDay: WeekPlannerInput['calendar']['days'][number],
  volume: ReturnType<typeof allocateWeeklyVolume>,
  intensity: ReturnType<typeof planIntensityTarget>,
  fatigue: ReturnType<typeof planFatigueBudget>,
): ProgrammeDay => {
  const type = calendarDay.planned_session_type;
  const rest = type === 'rest';
  const sport = type === 'sport';
  const resistance = type === 'resistance';
  const conditioning = type === 'conditioning';
  const workingSets =
    volume.session_set_budgets.get(calendarDay.cycle_day) ?? 0;
  const estimated = resistance
    ? sessionBudgetDuration(workingSets)
    : conditioning
      ? Math.min(30, input.profile.source.session_duration_min)
      : sport
        ? (input.profile.source.sport?.typical_duration_min ?? 60)
        : 20;
  const training_budget =
    rest || sport
      ? undefined
      : {
          total_working_set_budget: workingSets,
          muscle_group_budgets: resistance
            ? distributeRecord(
                volume.muscle_group_budgets,
                'muscle_group',
                'direct_set_target',
                input.strategy.resistance_frequency,
              )
            : {},
          movement_pattern_budgets: resistance
            ? distributeRecord(
                volume.movement_pattern_budgets,
                'movement_pattern',
                'set_target',
                input.strategy.resistance_frequency,
              )
            : {},
          intensity_intent: intensity.loading_intent,
          effort_target: intensity.primary_exercise_target_rpe,
          rpe_ceiling: intensity.maximum_allowed_rpe,
          fatigue_ceiling: fatigue.systemic_target,
          estimated_duration_min: estimated,
          rationale_codes: volume.rationale_codes,
        };

  return {
    day_id: `week-${weekNumber}-day-${calendarDay.cycle_day}`,
    cycle_day: calendarDay.cycle_day,
    ...(calendarDay.day_of_week
      ? { day_of_week: calendarDay.day_of_week }
      : {}),
    day_type: type,
    title: calendarDay.session_label,
    estimated_duration_min: rest ? null : estimated,
    maximum_duration_min: rest
      ? null
      : Math.max(estimated, input.profile.source.session_duration_min),
    fatigue_classification: rest
      ? 'none'
      : sport
        ? (input.profile.source.sport?.intensity ?? 'moderate')
        : fatigue.systemic_target,
    movement_emphasis: resistance
      ? volume.movement_pattern_budgets
          .filter((item) => item.set_target > 0)
          .map((item) => item.movement_pattern)
      : [],
    warmup: [],
    exercises: [],
    conditioning: [],
    cooldown: [],
    ...(training_budget ? { training_budget } : {}),
  };
};

export const planProgrammeWeeks = (
  input: WeekPlannerInput,
): ProgrammeWeekPlanResult => {
  const weeks: PlannedProgrammeWeek[] = [];
  const rationale: WeekPlanningDecision[] = [];
  const progressionPolicy = selectMachineProgressionPolicy(input);
  let previous: PlannedProgrammeWeek | undefined;

  input.phases.forEach((phase) => {
    for (let index = 0; index < phase.weeks_count; index += 1) {
      const week_number = phase.start_week + index;
      const week_type = selectWeekType(input, phase, week_number, index);
      const factors = planWeekFactors(input, phase, week_type, index, previous);
      const volume = allocateWeeklyVolume(input, factors.planned_volume_factor);
      const intensity = planIntensityTarget(
        input,
        week_type,
        factors.planned_intensity_factor,
        factors.planned_effort_factor,
      );
      const fatigue = planFatigueBudget(input, week_type);
      const rationale_codes = [
        ...new Set([...factors.rationale_codes, ...volume.rationale_codes]),
      ];
      const week: PlannedProgrammeWeek = {
        week_id: `${phase.phase_id}-week-${week_number}`,
        week_number,
        week_type,
        objective: phase.objective,
        planned_volume_factor: factors.planned_volume_factor,
        planned_intensity_factor: factors.planned_intensity_factor,
        planned_effort_factor: factors.planned_effort_factor,
        days: input.calendar.days.map((day) =>
          buildDay(input, week_number, day, volume, intensity, fatigue),
        ),
        progression_notes: [
          `Use ${progressionPolicy.model.replaceAll('_', ' ')} progression within the prescribed RPE ceiling.`,
        ],
        review_triggers: [
          {
            code: 'WEEKLY_PERFORMANCE_REVIEW',
            message:
              'Review repeated RPE overshoot, missed repetitions, pain, sleep and session completion.',
            trigger_type: 'performance',
          },
        ],
        planning_metadata: {
          muscle_group_budgets: volume.muscle_group_budgets,
          movement_pattern_budgets: volume.movement_pattern_budgets,
          intensity_target: intensity,
          progression_policy: progressionPolicy,
          fatigue_budget: fatigue,
          ...(deloadAdjustments(week_type)
            ? { deload_adjustments: deloadAdjustments(week_type) }
            : {}),
          rationale_codes,
        },
      };
      weeks.push(week);
      rationale_codes.forEach((code) =>
        rationale.push(
          decision(
            code,
            `Week ${week_number} applies ${code.toLowerCase().replaceAll('_', ' ')}.`,
            code.includes('UNKNOWN') ? 'low' : 'high',
          ),
        ),
      );
      previous = week;
    }
  });

  const phases = input.phases.map((phase) => ({
    ...phase,
    weeks: weeks.filter(
      (week) =>
        week.week_number >= phase.start_week &&
        week.week_number <= phase.end_week,
    ),
  }));

  return {
    weeks,
    phases,
    volume_plan: {
      weekly_targets: weeks.map((week) => ({
        week_number: week.week_number,
        total_working_sets: week.days.reduce(
          (sum, day) =>
            sum + (day.training_budget?.total_working_set_budget ?? 0),
          0,
        ),
        volume_factor: week.planned_volume_factor,
      })),
      rationale,
    },
    intensity_plan: {
      week_targets: weeks.map((week) => ({
        week_number: week.week_number,
        intensity_factor: week.planned_intensity_factor,
        effort_factor: week.planned_effort_factor,
        target: week.planning_metadata.intensity_target,
      })),
      rationale,
    },
    progression_plan: {
      default_policy: progressionPolicy,
      week_transition_rules: [
        'Increase one primary planning variable at a time.',
        'Hold progression after RPE overshoot or missed repetitions.',
        'Permit larger normalization only after a deload week.',
      ],
      rationale,
    },
    fatigue_plan: {
      weekly_budgets: weeks.map((week) => ({
        week_number: week.week_number,
        ...week.planning_metadata.fatigue_budget,
      })),
      planned_deload_weeks: input.planned_deload_weeks,
      rationale,
    },
    rationale,
  };
};
