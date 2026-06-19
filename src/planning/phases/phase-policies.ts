import type {
  PhaseArchitecture,
  PhaseTemplate,
  TrainingStrategyV2,
} from './phase.types.js';

export const phaseDirections = (
  type: PhaseArchitecture['phase_type'],
  objective: TrainingStrategyV2['primary_objective'],
): Pick<
  PhaseArchitecture,
  'volume_direction' | 'intensity_direction' | 'effort_direction'
> => {
  if (type === 'foundation') {
    return {
      volume_direction: objective === 'strength' ? 'maintain' : 'increase',
      intensity_direction: 'maintain',
      effort_direction: 'maintain',
    };
  }
  if (type === 'accumulation') {
    return {
      volume_direction: 'increase',
      intensity_direction: objective === 'strength' ? 'increase' : 'maintain',
      effort_direction: 'increase',
    };
  }
  if (type === 'intensification' || type === 'realization') {
    return {
      volume_direction: 'decrease',
      intensity_direction: 'increase',
      effort_direction: 'increase',
    };
  }
  if (type === 'recovery') {
    return {
      volume_direction: 'decrease',
      intensity_direction: 'decrease',
      effort_direction: 'decrease',
    };
  }
  return {
    volume_direction: 'maintain',
    intensity_direction: 'maintain',
    effort_direction: 'maintain',
  };
};

export const phase = (
  key: string,
  name: string,
  phase_type: PhaseTemplate['phase_type'],
  objective: string,
  rationale_code: string,
  minimum_weeks = phase_type === 'recovery' ? 1 : 2,
  weight = phase_type === 'recovery' ? 0.5 : 1,
): PhaseTemplate => ({
  key,
  name,
  phase_type,
  objective,
  rationale_code,
  minimum_weeks,
  weight,
});
