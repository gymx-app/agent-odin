import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type {
  PhaseArchitecture,
  PhaseTemplate,
  TrainingStrategyV2,
} from './phase.types.js';

type TrainingStatus = NormalizedAthleteProfile['athlete_state']['training_status']['value'];

export const phaseDirections = (
  type: PhaseArchitecture['phase_type'],
  objective: TrainingStrategyV2['primary_objective'],
  trainingStatus: TrainingStatus,
): Pick<
  PhaseArchitecture,
  'volume_direction' | 'intensity_direction' | 'effort_direction'
> => {
  if (type === 'foundation') {
    // Flat, low-RPE loading during Foundation is appropriate for true
    // novices building technique (Kraemer & Ratamess, 2004 ACSM position
    // stand), but the intensity that maximizes gains scales with training
    // status (Rhea et al., 2003, meta-analysis: novice ~60% 1RM, trained
    // ~80-85% 1RM) — holding it flat for an already-trained athlete
    // under-stimulates them for the whole phase. Only true novices (and
    // unknown status, which errs conservative) get 'maintain'.
    const isNovice = trainingStatus === 'beginner' || trainingStatus === 'unknown';
    return {
      volume_direction: objective === 'strength' ? 'maintain' : 'increase',
      // Same intensity rule Accumulation uses for this objective — a
      // trained athlete's Foundation phase behaves like Accumulation,
      // not like a novice's technique-acquisition window.
      intensity_direction:
        !isNovice && objective === 'strength' ? 'increase' : 'maintain',
      effort_direction: isNovice ? 'maintain' : 'increase',
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
