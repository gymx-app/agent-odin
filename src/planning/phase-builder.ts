import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeStrategy } from './planning.types.js';

export const buildFoundationPhase = (
  strategy: ProgrammeStrategy,
): OdinProgramme['phases'][number] => ({
  phase_number: 1,
  name: 'Foundation',
  goal: `Baseline ${strategy.goal.replaceAll('_', ' ')} training block`,
  weeks_count: strategy.programme_weeks,
  intensity_level: strategy.intensity_bias === 'high' ? 7 : 6,
  volume_level:
    strategy.volume_bias === 'high'
      ? 7
      : strategy.volume_bias === 'low'
        ? 4
        : 6,
  progression_intent: 'accumulation',
});
