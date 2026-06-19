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
      : selected.progression_model === 'wave_loading'
        ? 'ADVANCED_WAVE_LOADING_SELECTED'
        : 'INTERMEDIATE_DOUBLE_PROGRESSION_SELECTED',
    selected.progression_model,
    'Progression complexity matches training status and programme horizon.',
    ['athlete_state.training_status', 'programme_horizon_weeks'],
  );
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
