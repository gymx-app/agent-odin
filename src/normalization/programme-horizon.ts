import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type {
  GoalFeasibilityResult,
  WeightChangeResult,
} from './normalization.types.js';

const clampWeeks = (weeks: number): number =>
  Math.min(52, Math.max(4, Math.ceil(weeks)));

const defaultGoalHorizon = (input: AthleteInput): number => {
  if (input.goal === 'fat_loss') {
    return input.fitness_level === 'advanced' ? 16 : 12;
  }

  if (input.goal === 'muscle_gain') {
    return input.fitness_level === 'beginner' ? 12 : 16;
  }

  if (input.goal === 'recomposition') {
    if (input.fitness_level === 'beginner') {
      return input.available_days_per_week >= 4 ? 12 : 16;
    }

    return input.fitness_level === 'intermediate' ? 16 : 24;
  }

  if (input.goal === 'strength') {
    return input.fitness_level === 'beginner'
      ? 8
      : input.fitness_level === 'intermediate'
        ? 12
        : 16;
  }

  return input.fitness_level === 'beginner'
    ? 8
    : input.fitness_level === 'intermediate'
      ? 12
      : 16;
};

const selectFatLossRate = (input: AthleteInput): number => {
  const hasHighBodyFat =
    input.inbody !== null &&
    (input.inbody.body_fat_pct >= 30 || input.inbody.visceral_fat_area > 100);

  if (input.fitness_level === 'beginner' && hasHighBodyFat) {
    return 0.0075;
  }

  if (input.fitness_level === 'beginner') {
    return 0.006;
  }

  return 0.005;
};

const selectMuscleGainRateKgPerWeek = (input: AthleteInput): number => {
  if (input.fitness_level === 'beginner') {
    return 0.35;
  }

  if (input.fitness_level === 'intermediate') {
    return 0.25;
  }

  return 0.2;
};

export const estimateProgrammeHorizonWeeks = (
  input: AthleteInput,
  weightChange: WeightChangeResult,
): number => {
  if (weightChange.direction === 'maintain') {
    return defaultGoalHorizon(input);
  }

  if (input.goal === 'fat_loss') {
    if (weightChange.direction !== 'loss') {
      return defaultGoalHorizon(input);
    }

    const weeklyRateKg = input.current_weight_kg * selectFatLossRate(input);

    return clampWeeks(weightChange.absolute_change_kg / weeklyRateKg);
  }

  if (input.goal === 'muscle_gain') {
    if (weightChange.direction !== 'gain') {
      return defaultGoalHorizon(input);
    }

    const rawWeeks =
      weightChange.absolute_change_kg / selectMuscleGainRateKgPerWeek(input);

    return clampWeeks(Math.max(8, rawWeeks));
  }

  return defaultGoalHorizon(input);
};

export const assessGoalFeasibility = (
  input: AthleteInput,
  weightChange: WeightChangeResult,
  weeklyTrainingMinutes: number,
): GoalFeasibilityResult => {
  const reasons: string[] = [];

  if (input.inbody === null) {
    reasons.push('InBody data was not provided.');
  }

  if (weeklyTrainingMinutes < 60) {
    reasons.push('Weekly training time is very limited.');
  }

  if (input.goal === 'fat_loss' && weightChange.direction === 'gain') {
    reasons.push('Target weight is above current weight for a fat-loss goal.');
  }

  if (input.goal === 'muscle_gain' && weightChange.direction === 'loss') {
    reasons.push(
      'Target weight is below current weight for a muscle-gain goal.',
    );
  }

  if (weightChange.percentage_change_from_start >= 20) {
    reasons.push(
      'Requested weight change is large relative to current weight.',
    );
  }

  if (reasons.length === 0) {
    return {
      status: 'feasible',
      reasons: [],
    };
  }

  if (reasons.length === 1 && reasons[0] === 'InBody data was not provided.') {
    return {
      status: 'insufficient_information',
      reasons,
    };
  }

  return {
    status: 'feasible_with_adjusted_expectations',
    reasons,
  };
};
