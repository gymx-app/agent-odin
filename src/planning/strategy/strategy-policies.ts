import type { TrainingStrategyV2 } from './strategy.types.js';

export const STRATEGY_SCORE_WEIGHTS = {
  goal_alignment: 25,
  training_status_fit: 15,
  calendar_compatibility: 15,
  recovery_fit: 15,
  sport_compatibility: 10,
  energy_availability_fit: 10,
  programme_horizon_fit: 5,
  complexity_adherence_fit: 5,
} as const;

export const horizonCategory = (
  weeks: number,
): 'short' | 'medium' | 'long' | 'extended' =>
  weeks <= 6
    ? 'short'
    : weeks <= 12
      ? 'medium'
      : weeks <= 24
        ? 'long'
        : 'extended';

export const progressionComplexity: Record<
  TrainingStrategyV2['progression_model'],
  number
> = {
  linear_reps: 1,
  linear_load: 1,
  double_progression: 2,
  maintenance: 1,
  step_loading: 3,
  volume_then_intensity: 3,
  performance_based: 4,
  wave_loading: 4,
};

export const periodizationComplexity: Record<
  TrainingStrategyV2['periodization_model'],
  number
> = {
  simple_progressive: 1,
  maintenance: 1,
  concurrent: 2,
  block: 3,
  undulating: 4,
  competition_peak: 4,
};
