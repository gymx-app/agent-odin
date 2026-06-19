import {
  horizonCategory,
  periodizationComplexity,
  progressionComplexity,
  STRATEGY_SCORE_WEIGHTS,
} from './strategy-policies.js';
import type {
  ScoredStrategyCandidate,
  StrategyCandidate,
  StrategySelectorV2Input,
} from './strategy.types.js';

const clamp = (value: number): number => Math.max(0, Math.min(1, value));

const goalFit = (
  candidate: StrategyCandidate,
  input: StrategySelectorV2Input,
): number => {
  const goal = input.profile.source.goal;
  const model = candidate.strategy.periodization_model;
  if (candidate.strategy.primary_objective === 'sport_support') {
    return model === 'concurrent' || model === 'competition_peak' ? 1 : 0.7;
  }
  if (goal === 'strength') {
    if (input.profile.source.sport?.competition_date) {
      return model === 'competition_peak' ? 1 : model === 'block' ? 0.4 : 0.2;
    }
    return ['block', 'competition_peak', 'simple_progressive'].includes(model)
      ? 1
      : 0.6;
  }
  if (goal === 'muscle_gain') {
    return ['block', 'undulating', 'simple_progressive'].includes(model)
      ? 1
      : 0.6;
  }
  if (goal === 'fat_loss' || goal === 'endurance') {
    return ['concurrent', 'simple_progressive'].includes(model) ? 1 : 0.6;
  }
  return model === 'simple_progressive' ? 1 : 0.8;
};

export const strategyConstraintFailures = (
  candidate: StrategyCandidate,
  input: StrategySelectorV2Input,
): string[] => {
  const reasons: string[] = [];
  const training = input.profile.athlete_state.training_status.value;
  const recovery = input.profile.recovery_capacity;
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  const calendarResistance = input.calendar.days.filter(
    (day) => day.planned_session_type === 'resistance',
  ).length;

  if (candidate.strategy.resistance_frequency !== calendarResistance) {
    reasons.push('STRATEGY_CALENDAR_MISMATCH');
  }
  if (
    candidate.strategy.split_type === 'push_pull_legs' &&
    candidate.strategy.resistance_frequency === 6 &&
    (training === 'beginner' || recovery === 'low')
  ) {
    reasons.push('SIX_DAY_PPL_REJECTED_LOW_RECOVERY');
  }
  if (
    candidate.strategy.periodization_model === 'competition_peak' &&
    !input.profile.source.sport?.competition_date
  ) {
    reasons.push('COMPETITION_PEAK_REJECTED_NO_DATE');
  }
  if (
    ['wave_loading', 'performance_based'].includes(
      candidate.strategy.progression_model,
    ) &&
    training !== 'advanced'
  ) {
    reasons.push('ADVANCED_PROGRESSION_REQUIRES_ADVANCED_STATUS');
  }
  if (
    ['block', 'undulating', 'competition_peak'].includes(
      candidate.strategy.periodization_model,
    ) &&
    horizon === 'short'
  ) {
    reasons.push('PERIODIZATION_EXCESSIVE_FOR_HORIZON');
  }
  if (
    candidate.strategy.periodization_model === 'undulating' &&
    training === 'beginner'
  ) {
    reasons.push('PERIODIZATION_EXCESSIVE_FOR_TRAINING_STATUS');
  }
  if (
    candidate.strategy.periodization_model === 'maintenance' &&
    input.profile.source.goal !== 'endurance' &&
    !(
      input.profile.source.lifestyle?.travel_frequency === 'frequent' ||
      input.profile.recovery_capacity === 'low'
    )
  ) {
    reasons.push('MAINTENANCE_CONFLICTS_WITH_DEVELOPMENT_GOAL');
  }
  if (
    recovery === 'low' &&
    candidate.strategy.periodization_model === 'concurrent' &&
    (input.profile.source.sport?.sessions_per_week ?? 0) === 0 &&
    candidate.strategy.conditioning_frequency === 0
  ) {
    reasons.push('LOW_RECOVERY_COMPLEXITY_REDUCED');
  }

  return reasons;
};

export const scoreStrategyCandidate = (
  candidate: StrategyCandidate,
  input: StrategySelectorV2Input,
): ScoredStrategyCandidate => {
  const training = input.profile.athlete_state.training_status.value;
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  const idealComplexity =
    training === 'beginner' ? 2 : training === 'intermediate' ? 5 : 7;
  const complexityFit = clamp(
    1 - Math.abs(candidate.complexity - idealComplexity) / 6,
  );
  const recoveryFit =
    input.profile.recovery_capacity === 'low'
      ? clamp(1 - candidate.complexity / 8)
      : input.profile.recovery_capacity === 'high'
        ? clamp(0.6 + candidate.complexity / 12)
        : clamp(1 - Math.abs(candidate.complexity - 5) / 8);
  const energyFit =
    input.profile.source.nutrition?.calorie_status === 'deficit'
      ? candidate.strategy.volume_strategy === 'conservative'
        ? 1
        : 0.5
      : 1;
  const hasSport = (input.profile.source.sport?.sessions_per_week ?? 0) > 0;
  const sportFit = hasSport
    ? ['concurrent', 'competition_peak'].includes(
        candidate.strategy.periodization_model,
      )
      ? 1
      : 0.6
    : candidate.strategy.conditioning_strategy === 'sport_support'
      ? 0.5
      : 1;
  const horizonFit =
    horizon === 'short'
      ? candidate.complexity <= 3
        ? 1
        : 0.3
      : horizon === 'medium'
        ? candidate.complexity <= 6
          ? 1
          : 0.7
        : candidate.complexity >= 4
          ? 1
          : 0.8;
  const calendarCompatibility =
    candidate.strategy.cycle_length_days === input.calendar.cycle_length_days
      ? 1
      : 0;
  const score_breakdown = {
    goal_alignment:
      STRATEGY_SCORE_WEIGHTS.goal_alignment * goalFit(candidate, input),
    training_status_fit:
      STRATEGY_SCORE_WEIGHTS.training_status_fit * complexityFit,
    calendar_compatibility:
      STRATEGY_SCORE_WEIGHTS.calendar_compatibility * calendarCompatibility,
    recovery_fit: STRATEGY_SCORE_WEIGHTS.recovery_fit * recoveryFit,
    energy_availability_fit:
      STRATEGY_SCORE_WEIGHTS.energy_availability_fit * energyFit,
    sport_compatibility: STRATEGY_SCORE_WEIGHTS.sport_compatibility * sportFit,
    programme_horizon_fit:
      STRATEGY_SCORE_WEIGHTS.programme_horizon_fit * horizonFit,
    complexity_adherence_fit:
      STRATEGY_SCORE_WEIGHTS.complexity_adherence_fit * complexityFit,
  };

  return {
    ...candidate,
    score: Math.round(
      Object.values(score_breakdown).reduce((sum, value) => sum + value, 0),
    ),
    score_breakdown,
    calendar_compatibility: calendarCompatibility,
    recovery_fit: recoveryFit,
    progression_simplicity:
      5 - progressionComplexity[candidate.strategy.progression_model],
  };
};

export const compareStrategyCandidates = (
  left: ScoredStrategyCandidate,
  right: ScoredStrategyCandidate,
): number =>
  right.score - left.score ||
  left.exceptions.length - right.exceptions.length ||
  left.complexity - right.complexity ||
  right.calendar_compatibility - left.calendar_compatibility ||
  right.recovery_fit - left.recovery_fit ||
  right.progression_simplicity - left.progression_simplicity ||
  periodizationComplexity[left.strategy.periodization_model] -
    periodizationComplexity[right.strategy.periodization_model] ||
  left.candidate_id.localeCompare(right.candidate_id);
