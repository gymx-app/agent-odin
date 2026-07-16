import { PlannerError } from '../planner-errors.js';
import { buildStrategyCandidates } from './strategy-candidate-builder.js';
import {
  compareStrategyCandidates,
  scoreStrategyCandidate,
  strategyConstraintFailures,
} from './strategy-scorer.js';
import type {
  ProgrammeStrategyResult,
  StrategyDecision,
  StrategySelectorV2Input,
} from './strategy.types.js';

const rationaleFor = (
  input: StrategySelectorV2Input,
  selected: ProgrammeStrategyResult['strategy'],
): StrategyDecision[] => {
  const decisions: StrategyDecision[] = [];
  const training = input.profile.athlete_state.training_status.value;
  const add = (
    code: string,
    selected_value: string,
    reason: string,
    source_fields: string[],
  ) =>
    decisions.push({
      code,
      selected_value,
      reason,
      source_fields,
      confidence:
        input.profile.programme_confidence === 'medium'
          ? 'moderate'
          : input.profile.programme_confidence,
    });

  add(
    training === 'beginner'
      ? 'BEGINNER_SIMPLE_PROGRESSION_SELECTED'
      : selected.progression_model === 'linear_load'
        ? 'STRENGTH_LOAD_PROGRESSION_SELECTED'
        : selected.progression_model === 'wave_loading'
          ? 'ADVANCED_WAVE_LOADING_SELECTED'
          : 'INTERMEDIATE_DOUBLE_PROGRESSION_SELECTED',
    selected.progression_model,
    'Progression complexity matches training status and programme horizon.',
    ['athlete_state.training_status', 'programme_horizon_weeks'],
  );
  if (selected.progression_model === 'linear_load') {
    add(
      'SCHOENFELD_2021_LOAD_HYPERTROPHY',
      selected.progression_model,
      'Strength-primary goal: load is the target variable, not reps/effort — heavier loads are directly superior for maximal strength, even though hypertrophy is comparable across a wide load range.',
      ['goal'],
    );
  }
  if (input.profile.source.nutrition?.calorie_status === 'deficit') {
    add(
      'CALORIC_DEFICIT_VOLUME_CONSTRAINED',
      selected.volume_strategy,
      'Explicit energy deficit limits recoverable volume without changing the stated goal.',
      ['nutrition.calorie_status'],
    );
  }
  if (selected.periodization_model === 'concurrent') {
    add(
      'SPORT_CONCURRENT_MODEL_SELECTED',
      selected.periodization_model,
      'Resistance and sport or conditioning demands require concurrent planning.',
      ['sport', 'calendar.days'],
    );
  } else if (selected.periodization_model === 'block') {
    add(
      'LONG_HORIZON_BLOCK_MODEL_SELECTED',
      selected.periodization_model,
      'Training status and horizon support phase-specific development.',
      ['programme_horizon_weeks', 'athlete_state.training_status'],
    );
  } else if (selected.periodization_model === 'competition_peak') {
    add(
      'COMPETITION_PEAK_SELECTED',
      selected.periodization_model,
      'A dated competition target supports a final performance phase.',
      ['sport.competition_date', 'goal'],
    );
  } else {
    add(
      'SHORT_HORIZON_SIMPLE_MODEL_SELECTED',
      selected.periodization_model,
      'A lower-complexity model provides sufficient structure.',
      ['programme_horizon_weeks', 'athlete_state.training_status'],
    );
  }
  if (input.profile.recovery_capacity === 'low') {
    add(
      'LOW_RECOVERY_COMPLEXITY_REDUCED',
      selected.periodization_model,
      'Low recovery capacity favors simpler architecture and conservative volume.',
      ['athlete_state.recovery_capacity'],
    );
  }
  add(
    selected.fatigue_strategy === 'planned_deload' ||
      selected.fatigue_strategy === 'combined'
      ? 'PLANNED_DELOAD_SELECTED'
      : selected.fatigue_strategy === 'readiness_triggered'
        ? 'READINESS_TRIGGERED_DELOAD_SELECTED'
        : 'NO_DELOAD_REQUIRED',
    selected.fatigue_strategy,
    'Fatigue management follows horizon, training status, recovery, and sport load.',
    [
      'programme_horizon_weeks',
      'athlete_state.training_status',
      'athlete_state.recovery_capacity',
      'sport',
    ],
  );

  // odin-programme-design-logic.md, Section 1 / Section 6: every programme
  // needs a stated split rationale. requiresSafeSplit mirrors
  // strategy-validator.ts's STRATEGY_SPLIT_SAFETY_OVERRIDE_VIOLATED check —
  // keep both in sync.
  const requiresSafeSplit =
    training === 'returning' ||
    input.profile.recovery_capacity === 'low' ||
    input.profile.movement_restrictions.some(
      (restriction) => restriction.severity === 'avoid',
    ) ||
    input.profile.health_flags.some((flag) => flag.severity === 'blocking');
  add(
    'SPLIT_TYPE_DECISION',
    selected.split_type,
    requiresSafeSplit
      ? 'Return-to-training status, low recovery capacity, an avoid-severity movement restriction, or a blocking health flag requires full_body or upper_lower regardless of days available — a conservative safety default, not evidence from a specific trial.'
      : 'Split chosen from available_days_per_week: enough days to hit each muscle group more than once weekly without exceeding available session-days. Frequency is a volume-distribution tool, not independently superior to lower frequency once weekly volume is equated.',
    ['available_days_per_week'],
  );
  if (requiresSafeSplit) {
    add(
      'RETURN_TO_TRAINING_SPLIT_OVERRIDE',
      selected.split_type,
      'Safety override triggered ahead of the days-count table.',
      [
        'athlete_state.training_status',
        'athlete_state.recovery_capacity',
        'movement_restrictions',
        'health_flags',
      ],
    );
  } else {
    add(
      'SCHOENFELD_2016_FREQUENCY',
      selected.split_type,
      'Training a muscle group 2+ times/week outperforms 1x/week on hypertrophy when weekly volume is not equated.',
      ['available_days_per_week'],
    );
    add(
      'SCHOENFELD_2019_FREQUENCY_VOLUME_EQUATED',
      selected.split_type,
      'No significant difference between higher and lower frequency once total weekly volume is equated — cited alongside SCHOENFELD_2016_FREQUENCY, never in its place.',
      ['available_days_per_week'],
    );
  }

  return decisions;
};

export const selectProgrammeStrategyV2 = (
  input: StrategySelectorV2Input,
): ProgrammeStrategyResult => {
  const rejected: ProgrammeStrategyResult['rejected_candidates'] = [];
  const valid = buildStrategyCandidates(input).flatMap((candidate) => {
    const reasons = strategyConstraintFailures(candidate, input);
    if (reasons.length > 0) {
      rejected.push({ candidate_id: candidate.candidate_id, reasons });
      return [];
    }
    return [scoreStrategyCandidate(candidate, input)];
  });

  if (valid.length === 0) {
    throw new PlannerError(
      'STRATEGY_UNSATISFIABLE',
      'No V2 strategy satisfies the athlete and calendar constraints.',
      { rejected_candidates: rejected },
    );
  }

  const selected = [...valid].sort(compareStrategyCandidates)[0]!;
  const rationale = rationaleFor(input, {
    ...selected.strategy,
    rationale: [],
  });

  return {
    strategy: { ...selected.strategy, rationale },
    selected_candidate_id: selected.candidate_id,
    score: selected.score,
    rationale,
    rejected_candidates: rejected,
  };
};
