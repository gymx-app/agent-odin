import type {
  PlannedProgrammeWeek,
  WeekPlannerInput,
  WeekPlanningMetadata,
} from '../weeks/week.types.js';

export const planIntensityTarget = (
  input: WeekPlannerInput,
  weekType: PlannedProgrammeWeek['week_type'],
  intensityFactor: number,
  effortFactor: number,
): WeekPlanningMetadata['intensity_target'] => {
  const beginner =
    input.profile.athlete_state.training_status.value === 'beginner';
  const deficit = input.profile.source.nutrition?.calorie_status === 'deficit';
  const strength = input.strategy.primary_objective === 'strength';
  const hypertrophy = input.strategy.primary_objective === 'muscle_gain';
  const basePrimary = beginner ? 6 : strength ? 7.5 : 7;
  const deload = weekType === 'deload';
  const target = Math.min(
    8.5,
    Math.max(5, basePrimary * effortFactor * (deload ? 0.95 : 1)),
  );
  const maximum = Math.min(
    beginner || deficit ? 8 : 9,
    Math.max(target, target + 0.75),
  );

  return {
    rep_emphasis: strength
      ? 'strength'
      : hypertrophy
        ? 'hypertrophy'
        : input.strategy.primary_objective === 'endurance'
          ? 'endurance_accessory'
          : 'mixed',
    loading_intent: deload
      ? 'light'
      : intensityFactor >= 1.08
        ? 'heavy'
        : intensityFactor <= 0.9
          ? 'technique'
          : strength
            ? 'heavy'
            : 'moderate',
    primary_exercise_target_rpe: Number(target.toFixed(1)),
    secondary_exercise_target_rpe: Number(Math.max(5, target - 0.5).toFixed(1)),
    accessory_target_rpe: Number(Math.max(5, target - 0.25).toFixed(1)),
    maximum_allowed_rpe: Number(maximum.toFixed(1)),
    failure_exposure_policy:
      beginner || deficit || strength
        ? 'none'
        : input.profile.athlete_state.training_status.value === 'advanced' &&
            hypertrophy
          ? 'limited_isolation_only'
          : 'last_set_optional',
  };
};
