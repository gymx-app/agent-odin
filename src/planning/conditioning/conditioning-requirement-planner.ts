import type {
  ConditioningPlanInput,
  ConditioningRequirement,
} from './conditioning.types.js';

export const planConditioningRequirement = (
  input: ConditioningPlanInput,
): ConditioningRequirement => {
  const sportSessions = input.profile.source.sport?.sessions_per_week ?? 0;
  if (input.strategy.conditioning_strategy === 'none' && sportSessions === 0) {
    return 'none';
  }
  if (input.strategy.primary_objective === 'endurance') return 'performance';
  if (input.strategy.conditioning_strategy === 'performance') {
    return 'performance';
  }
  if (sportSessions >= input.strategy.conditioning_frequency) {
    return input.strategy.conditioning_strategy === 'sport_support'
      ? 'maintenance'
      : 'supportive';
  }
  if (
    input.strategy.conditioning_strategy === 'fat_loss_support' ||
    input.strategy.conditioning_strategy === 'aerobic_base'
  ) {
    return 'developmental';
  }
  if (input.strategy.conditioning_strategy === 'maintenance') {
    return 'maintenance';
  }
  return 'minimum_health';
};
