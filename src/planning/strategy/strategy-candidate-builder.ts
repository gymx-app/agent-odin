import type {
  StrategyCandidate,
  StrategySelectorV2Input,
  TrainingStrategyV2,
} from './strategy.types.js';
import {
  horizonCategory,
  periodizationComplexity,
  progressionComplexity,
} from './strategy-policies.js';

const resistanceFrequency = (
  calendar: StrategySelectorV2Input['calendar'],
): number =>
  calendar.days.filter((day) => day.planned_session_type === 'resistance')
    .length;

const conditioningFrequency = (
  calendar: StrategySelectorV2Input['calendar'],
): number =>
  calendar.days.filter((day) => day.planned_session_type === 'conditioning')
    .length;

const splitFromCalendar = (
  calendar: StrategySelectorV2Input['calendar'],
): TrainingStrategyV2['split_type'] => {
  const kinds = new Set(
    calendar.days
      .filter((day) => day.planned_session_type === 'resistance')
      .map((day) => day.session_kind),
  );
  if (kinds.size === 1 && kinds.has('full_body')) return 'full_body';
  if ([...kinds].every((kind) => kind === 'upper' || kind === 'lower')) {
    return 'upper_lower';
  }
  if (
    [...kinds].every(
      (kind) => kind === 'push' || kind === 'pull' || kind === 'legs',
    )
  ) {
    return 'push_pull_legs';
  }
  return 'hybrid';
};

const objective = (
  input: StrategySelectorV2Input,
): TrainingStrategyV2['primary_objective'] =>
  input.profile.source.sport?.priority === 'primary'
    ? 'sport_support'
    : input.profile.source.goal;

const volumeStrategy = (
  input: StrategySelectorV2Input,
): TrainingStrategyV2['volume_strategy'] => {
  const profile = input.profile;
  if (
    profile.recovery_capacity === 'low' ||
    profile.source.nutrition?.calorie_status === 'deficit' ||
    profile.athlete_state.training_status.value === 'beginner'
  ) {
    return 'conservative';
  }
  if (
    profile.source.goal === 'muscle_gain' &&
    profile.recovery_capacity === 'high' &&
    profile.source.session_duration_min >= 60
  ) {
    return 'high';
  }
  return 'moderate';
};

const intensityStrategy = (
  input: StrategySelectorV2Input,
): TrainingStrategyV2['intensity_strategy'] => {
  if (input.profile.athlete_state.training_status.value === 'beginner') {
    return 'technique_first';
  }
  if (input.profile.source.goal === 'strength') return 'strength_emphasis';
  if (input.profile.source.goal === 'muscle_gain') {
    return 'hypertrophy_emphasis';
  }
  return input.profile.source.goal === 'recomposition'
    ? 'mixed'
    : 'moderate_loading';
};

const conditioningStrategy = (
  input: StrategySelectorV2Input,
): TrainingStrategyV2['conditioning_strategy'] => {
  if ((input.profile.source.sport?.sessions_per_week ?? 0) > 0) {
    return 'sport_support';
  }
  if (input.profile.source.goal === 'fat_loss') return 'fat_loss_support';
  if (input.profile.source.goal === 'endurance') return 'aerobic_base';
  if (conditioningFrequency(input.calendar) > 0) return 'health_minimum';
  return 'none';
};

const fatigueStrategy = (
  input: StrategySelectorV2Input,
  periodization: TrainingStrategyV2['periodization_model'],
): TrainingStrategyV2['fatigue_strategy'] => {
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  const advanced =
    input.profile.athlete_state.training_status.value === 'advanced';
  const sport = (input.profile.source.sport?.sessions_per_week ?? 0) > 0;

  if (horizon === 'short') return 'none';
  if (advanced && (horizon === 'long' || horizon === 'extended') && sport) {
    return 'combined';
  }
  if (
    periodization === 'block' ||
    periodization === 'competition_peak' ||
    horizon === 'long' ||
    horizon === 'extended'
  ) {
    return 'planned_deload';
  }
  return 'readiness_triggered';
};

const candidate = (
  input: StrategySelectorV2Input,
  periodization_model: TrainingStrategyV2['periodization_model'],
  progression_model: TrainingStrategyV2['progression_model'],
): StrategyCandidate => {
  const strategy = {
    primary_objective: objective(input),
    periodization_model,
    progression_model,
    split_type: splitFromCalendar(input.calendar),
    resistance_frequency: resistanceFrequency(input.calendar),
    conditioning_frequency: conditioningFrequency(input.calendar),
    cycle_length_days: input.calendar.cycle_length_days,
    volume_strategy: volumeStrategy(input),
    intensity_strategy: intensityStrategy(input),
    fatigue_strategy: fatigueStrategy(input, periodization_model),
    conditioning_strategy: conditioningStrategy(input),
  };
  return {
    candidate_id: `${periodization_model}_${progression_model}_${strategy.split_type}`,
    strategy,
    complexity:
      periodizationComplexity[periodization_model] +
      progressionComplexity[progression_model],
    exceptions: [],
  };
};

export const buildStrategyCandidates = (
  input: StrategySelectorV2Input,
): StrategyCandidate[] => {
  const trainingStatus = input.profile.athlete_state.training_status.value;
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  const hasSport = (input.profile.source.sport?.sessions_per_week ?? 0) > 0;
  const competition =
    input.profile.source.goal === 'strength' &&
    input.profile.source.sport?.competition_date;
  // odin-programme-design-logic.md, Section 4: strength-primary means load
  // is the target variable, not reps/effort — linear_load makes that the
  // progression axis directly, instead of the reps-then-load double
  // progression every other goal uses. Beginners still get linear_reps
  // first (technique/ROM before load progression, per the same section).
  const strengthPrimary = input.profile.source.goal === 'strength';
  const pairs: Array<
    [
      TrainingStrategyV2['periodization_model'],
      TrainingStrategyV2['progression_model'],
    ]
  > = [
    [
      'simple_progressive',
      trainingStatus === 'beginner'
        ? 'linear_reps'
        : strengthPrimary
          ? 'linear_load'
          : 'double_progression',
    ],
    ['concurrent', 'double_progression'],
    ['block', trainingStatus === 'advanced' ? 'wave_loading' : 'step_loading'],
    ['undulating', 'wave_loading'],
    ['maintenance', 'maintenance'],
  ];

  if (competition && horizon !== 'short') {
    pairs.push(['competition_peak', 'performance_based']);
  }
  if (
    !hasSport &&
    input.profile.source.goal !== 'endurance' &&
    input.profile.source.goal !== 'fat_loss' &&
    conditioningFrequency(input.calendar) === 0
  ) {
    const index = pairs.findIndex(([model]) => model === 'concurrent');
    if (index >= 0) pairs.splice(index, 1);
  }

  return pairs.map(([periodization, progression]) =>
    candidate(input, periodization, progression),
  );
};
