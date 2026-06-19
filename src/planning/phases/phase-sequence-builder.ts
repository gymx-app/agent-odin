import { horizonCategory } from '../strategy/strategy-policies.js';
import { phase } from './phase-policies.js';
import type { PhasePlannerInput, PhaseTemplate } from './phase.types.js';

const beginnerSequence = (input: PhasePlannerInput): PhaseTemplate[] => {
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  if (horizon === 'short') {
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish technique and repeatable training.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'progression',
        'Progression',
        'accumulation',
        'Progress simple repeatable training demand.',
        'BEGINNER_PHASE_COMPLEXITY_REDUCED',
      ),
    ];
  }
  if (horizon === 'medium') {
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish technique and repeatable training.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'progression',
        'Progression',
        'accumulation',
        'Progress simple repeatable training demand.',
        'BEGINNER_PHASE_COMPLEXITY_REDUCED',
      ),
      phase(
        'consolidation',
        'Consolidation',
        'maintenance',
        'Consolidate technique and adherence.',
        'CONSOLIDATION_PHASE_SELECTED',
      ),
    ];
  }
  return [
    phase(
      'foundation',
      'Foundation',
      'foundation',
      'Establish technique and repeatable training.',
      'FOUNDATION_PHASE_REQUIRED',
    ),
    phase(
      'progression-1',
      'Progression',
      'accumulation',
      'Build training capacity progressively.',
      'BEGINNER_PHASE_COMPLEXITY_REDUCED',
    ),
    phase(
      'recovery',
      'Recovery',
      'recovery',
      'Reduce accumulated fatigue.',
      'RECOVERY_PHASE_INSERTED',
    ),
    phase(
      'progression-2',
      'Progression',
      'accumulation',
      'Resume simple progression.',
      'BEGINNER_PHASE_COMPLEXITY_REDUCED',
    ),
    phase(
      'consolidation',
      'Consolidation',
      'maintenance',
      'Consolidate sustainable progress.',
      'CONSOLIDATION_PHASE_SELECTED',
    ),
  ];
};

export const buildPhaseSequence = (
  input: PhasePlannerInput,
): PhaseTemplate[] => {
  const training = input.profile.athlete_state.training_status.value;
  const horizon = horizonCategory(input.profile.programme_horizon_weeks);
  const objective = input.strategy.primary_objective;

  if (training === 'beginner') return beginnerSequence(input);

  if (objective === 'fat_loss') {
    if (horizon === 'short') {
      return [
        phase(
          'foundation',
          'Foundation',
          'foundation',
          'Establish sustainable training.',
          'FOUNDATION_PHASE_REQUIRED',
        ),
        phase(
          'fat-loss',
          'Fat Loss',
          'accumulation',
          'Support fat loss while preserving resistance quality.',
          'FAT_LOSS_PHASE_SELECTED',
        ),
      ];
    }
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish sustainable training.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'fat-loss',
        'Fat Loss',
        'accumulation',
        'Support fat loss while preserving resistance quality.',
        'FAT_LOSS_PHASE_SELECTED',
      ),
      ...(input.strategy.fatigue_strategy === 'planned_deload' ||
      input.strategy.fatigue_strategy === 'combined'
        ? [
            phase(
              'recovery',
              'Recovery',
              'recovery',
              'Reduce accumulated fatigue.',
              'RECOVERY_PHASE_INSERTED',
            ),
          ]
        : []),
      phase(
        'progression',
        'Progression',
        'accumulation',
        'Progress recoverable resistance demand.',
        'PHASE_LENGTH_ADJUSTED_TO_HORIZON',
      ),
      phase(
        'consolidation',
        'Consolidation',
        'maintenance',
        'Consolidate strength-preserving habits.',
        'CONSOLIDATION_PHASE_SELECTED',
      ),
    ];
  }

  if (objective === 'muscle_gain') {
    if (training === 'intermediate' && horizon !== 'short') {
      return [
        phase(
          'foundation',
          'Foundation',
          'foundation',
          'Establish baseline volume and technique.',
          'FOUNDATION_PHASE_REQUIRED',
        ),
        phase(
          'hypertrophy',
          'Hypertrophy',
          'accumulation',
          'Build recoverable hypertrophy volume.',
          'HYPERTROPHY_PHASE_SELECTED',
        ),
        phase(
          'recovery',
          'Recovery',
          'recovery',
          'Reduce accumulated fatigue.',
          'RECOVERY_PHASE_INSERTED',
        ),
      ];
    }
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish baseline volume and technique.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'hypertrophy-1',
        'Hypertrophy',
        'accumulation',
        'Build targeted hypertrophy volume.',
        'HYPERTROPHY_PHASE_SELECTED',
      ),
      phase(
        'intensification',
        'Strength',
        'intensification',
        'Increase loading while retaining hypertrophy exposure.',
        'STRENGTH_PHASE_SELECTED',
      ),
      phase(
        'recovery',
        'Recovery',
        'recovery',
        'Reduce accumulated fatigue.',
        'RECOVERY_PHASE_INSERTED',
      ),
      phase(
        'hypertrophy-2',
        'Hypertrophy',
        'accumulation',
        'Resume hypertrophy development.',
        'HYPERTROPHY_PHASE_SELECTED',
      ),
    ];
  }

  if (objective === 'strength') {
    const competition =
      input.strategy.periodization_model === 'competition_peak';
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish technical and loading baseline.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'volume',
        'Progression',
        'accumulation',
        'Build strength-supporting volume.',
        'STRENGTH_PHASE_SELECTED',
      ),
      ...(input.strategy.fatigue_strategy === 'planned_deload' ||
      input.strategy.fatigue_strategy === 'combined'
        ? [
            phase(
              'recovery',
              'Recovery',
              'recovery',
              'Reduce fatigue before strength emphasis.',
              'RECOVERY_PHASE_INSERTED',
            ),
          ]
        : []),
      phase(
        'strength',
        'Strength',
        'intensification',
        'Increase strength-specific loading.',
        'STRENGTH_PHASE_SELECTED',
      ),
      ...(competition || horizon === 'long' || horizon === 'extended'
        ? [
            phase(
              'performance',
              'Performance',
              'realization',
              'Express strength with reduced volume.',
              'PERFORMANCE_PHASE_SELECTED',
              1,
              0.75,
            ),
          ]
        : []),
    ];
  }

  if (objective === 'sport_support') {
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish resistance support capacity.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'strength-support',
        'Strength',
        'accumulation',
        'Build sport-supporting strength.',
        'STRENGTH_PHASE_SELECTED',
      ),
      phase(
        'sport-performance',
        'Performance',
        'intensification',
        'Prioritize sport quality and compatible strength.',
        'PERFORMANCE_PHASE_SELECTED',
      ),
      phase(
        'maintenance',
        'Maintenance',
        'maintenance',
        'Maintain useful qualities around sport demand.',
        'CONSOLIDATION_PHASE_SELECTED',
      ),
    ];
  }

  if (objective === 'endurance') {
    return [
      phase(
        'foundation',
        'Foundation',
        'foundation',
        'Establish concurrent training tolerance.',
        'FOUNDATION_PHASE_REQUIRED',
      ),
      phase(
        'aerobic-base',
        'Progression',
        'accumulation',
        'Build aerobic capacity with resistance continuity.',
        'PHASE_LENGTH_ADJUSTED_TO_HORIZON',
      ),
      phase(
        'performance',
        'Performance',
        'intensification',
        'Emphasize endurance performance.',
        'PERFORMANCE_PHASE_SELECTED',
      ),
      phase(
        'recovery',
        'Recovery',
        'recovery',
        'Reduce accumulated fatigue.',
        'RECOVERY_PHASE_INSERTED',
      ),
    ];
  }

  return [
    phase(
      'foundation',
      'Foundation',
      'foundation',
      'Establish a repeatable baseline.',
      'FOUNDATION_PHASE_REQUIRED',
    ),
    phase(
      'recomposition',
      'Progression',
      'accumulation',
      'Progress balanced body-composition training.',
      'PHASE_LENGTH_ADJUSTED_TO_HORIZON',
    ),
    phase(
      'consolidation',
      'Consolidation',
      'maintenance',
      'Consolidate sustainable progress.',
      'CONSOLIDATION_PHASE_SELECTED',
    ),
  ];
};
