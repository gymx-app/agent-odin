import type { PhaseArchitecture } from '../phases/phase.types.js';
import { MAX_WEEKLY_VOLUME_INCREASE, WEEK_FACTORS } from './week-policies.js';
import type { PlannedProgrammeWeek, WeekPlannerInput } from './week.types.js';

export const planWeekFactors = (
  input: WeekPlannerInput,
  phase: PhaseArchitecture,
  weekType: PlannedProgrammeWeek['week_type'],
  phaseWeekIndex: number,
  previous?: Pick<
    PlannedProgrammeWeek,
    | 'week_type'
    | 'planned_volume_factor'
    | 'planned_intensity_factor'
    | 'planned_effort_factor'
  >,
): {
  planned_volume_factor: number;
  planned_intensity_factor: number;
  planned_effort_factor: number;
  rationale_codes: string[];
} => {
  const base = WEEK_FACTORS[weekType];
  const status = input.profile.athlete_state.training_status.value;
  const maxIncrease = MAX_WEEKLY_VOLUME_INCREASE[status];
  const phaseProgress =
    phase.weeks_count <= 1 ? 0 : phaseWeekIndex / (phase.weeks_count - 1);
  let volume: number = base.volume;
  let intensity: number = base.intensity;
  let effort: number = base.effort;
  const rationale_codes = [`${weekType.toUpperCase()}_WEEK_SELECTED`];

  if (weekType === 'loading') {
    if (phase.volume_direction === 'increase') volume += phaseProgress * 0.08;
    if (phase.volume_direction === 'decrease') volume -= phaseProgress * 0.08;
    if (phase.intensity_direction === 'increase') {
      intensity += phaseProgress * 0.08;
    }
    if (phase.effort_direction === 'increase') effort += phaseProgress * 0.05;
  }
  if (input.profile.source.nutrition?.calorie_status === 'deficit') {
    volume = Math.min(volume, 1);
    effort = Math.min(effort, 1);
    rationale_codes.push('DEFICIT_VOLUME_CONSTRAINED');
  }
  if (
    input.profile.athlete_state.training_status.value === 'returning' &&
    weekType === 'introduction'
  ) {
    volume = 0.7;
    intensity = 0.85;
    effort = 0.8;
    rationale_codes.push('EFFORT_CEILING_REDUCED');
  }
  if (
    previous &&
    previous.week_type !== 'deload' &&
    volume > previous.planned_volume_factor * (1 + maxIncrease)
  ) {
    volume = Number(
      (previous.planned_volume_factor * (1 + maxIncrease)).toFixed(2),
    );
    rationale_codes.push('VOLUME_INCREASE_LIMITED');
  }
  if (previous && previous.week_type !== 'deload') {
    const volumeIncrease = volume - previous.planned_volume_factor;
    const intensityIncrease = intensity - previous.planned_intensity_factor;
    const effortIncrease = effort - previous.planned_effort_factor;
    const largeIncreases = [
      volumeIncrease > 0.05,
      intensityIncrease > 0.05,
      effortIncrease > 0.05,
    ].filter(Boolean).length;

    if (largeIncreases > 1) {
      if (phase.intensity_direction === 'increase') {
        volume = previous.planned_volume_factor;
        effort = previous.planned_effort_factor;
      } else if (phase.volume_direction === 'increase') {
        intensity = previous.planned_intensity_factor;
        effort = previous.planned_effort_factor;
      } else {
        volume = previous.planned_volume_factor;
        intensity = previous.planned_intensity_factor;
      }
      rationale_codes.push('COMBINED_LOAD_INCREASE_AVOIDED');
    }
    if (intensity > previous.planned_intensity_factor + 0.1) {
      intensity = previous.planned_intensity_factor + 0.1;
      rationale_codes.push('INTENSITY_INCREASE_LIMITED');
    }
    if (effort > previous.planned_effort_factor + 0.1) {
      effort = previous.planned_effort_factor + 0.1;
      rationale_codes.push('EFFORT_INCREASE_LIMITED');
    }
  }

  return {
    planned_volume_factor: Number(volume.toFixed(2)),
    planned_intensity_factor: Number(intensity.toFixed(2)),
    planned_effort_factor: Number(effort.toFixed(2)),
    rationale_codes,
  };
};
