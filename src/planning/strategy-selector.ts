import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { ProgrammeStrategy, SplitType } from './planning.types.js';
import { PlannerError } from './planner-errors.js';

const selectSplitType = (profile: NormalizedAthleteProfile): SplitType => {
  const days = profile.source.available_days_per_week;

  if (days <= 3) {
    return 'full_body';
  }

  if (days === 4) {
    return 'upper_lower';
  }

  if (
    days === 6 &&
    profile.source.fitness_level !== 'beginner' &&
    profile.recovery_capacity !== 'low'
  ) {
    return 'push_pull_legs';
  }

  return 'hybrid';
};

export const selectProgrammeStrategy = (
  profile: NormalizedAthleteProfile,
): ProgrammeStrategy => {
  const days = profile.source.available_days_per_week;

  if (days < 2 || days > 7) {
    throw new PlannerError(
      'UNSUPPORTED_TRAINING_SCHEDULE',
      `Unsupported training schedule: ${days} days.`,
    );
  }

  const splitType = selectSplitType(profile);
  const programmeWeeks = Math.min(
    8,
    Math.max(4, profile.programme_horizon_weeks),
  );
  const rationaleCodes: string[] = [
    `${days}_available_days`,
    `${profile.source.goal}_goal`,
  ];

  let resistanceDays = days;
  let lissDays = 0;

  if (days === 5) {
    if (
      profile.source.goal === 'fat_loss' ||
      profile.source.goal === 'recomposition'
    ) {
      resistanceDays = 4;
      lissDays = 1;
      rationaleCodes.push('liss_for_body_composition_goal');
    } else if (profile.source.goal === 'endurance') {
      resistanceDays = 2;
      lissDays = 3;
      rationaleCodes.push('endurance_liss_priority');
    } else if (profile.source.goal === 'strength') {
      resistanceDays = 4;
      lissDays = 1;
      rationaleCodes.push('strength_low_fatigue_fifth_day');
    }
  }

  if (days === 6 && splitType !== 'push_pull_legs') {
    resistanceDays = 5;
    lissDays = profile.source.goal === 'endurance' ? 1 : 0;
    rationaleCodes.push('six_day_conservative_fallback');
  }

  if (days === 7) {
    resistanceDays = profile.source.goal === 'endurance' ? 3 : 5;
    lissDays = profile.source.goal === 'endurance' ? 3 : 1;
    rationaleCodes.push('seven_days_capped_active_training');
  }

  const restDays = 7 - resistanceDays - lissDays;

  return {
    goal: profile.source.goal,
    split_type: splitType,
    resistance_days: resistanceDays,
    liss_days: lissDays,
    rest_days: Math.max(0, restDays),
    programme_weeks: programmeWeeks,
    progression_model: 'double_progression',
    default_rpe_range:
      profile.source.fitness_level === 'beginner'
        ? { min: 6, max: 7 }
        : profile.source.fitness_level === 'intermediate'
          ? { min: 7, max: 8 }
          : { min: 7, max: 8 },
    volume_bias:
      profile.source.goal === 'muscle_gain' ||
      profile.source.goal === 'recomposition'
        ? 'moderate'
        : profile.recovery_capacity === 'low'
          ? 'low'
          : 'moderate',
    intensity_bias: profile.source.goal === 'strength' ? 'high' : 'moderate',
    rationale_codes: rationaleCodes,
  };
};
