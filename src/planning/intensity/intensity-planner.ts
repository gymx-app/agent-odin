import type {
  PlannedProgrammeWeek,
  WeekPlannerInput,
  WeekPlanningMetadata,
} from '../weeks/week.types.js';

// Daily undulating periodization (DUP): Rhea et al. (2002) and Apel et al.
// (2011) compared DUP against traditional block-only periodization and
// found DUP at least as effective for strength, with better session-to-
// session variety. The structural principle is rotating intensity across
// the week's resistance days (heavy/moderate/light) rather than holding
// one flat target all week — this only fires when periodization_model is
// actually 'undulating'; every other model keeps today's flat-per-week
// behavior unchanged.
export type UndulatingDayRole = 'heavy' | 'moderate' | 'light';

const UNDULATING_ROLE_CYCLE: readonly UndulatingDayRole[] = [
  'heavy',
  'moderate',
  'light',
];

export const undulatingDayRoleForIndex = (
  resistanceDayIndexInWeek: number,
): UndulatingDayRole =>
  UNDULATING_ROLE_CYCLE[resistanceDayIndexInWeek % UNDULATING_ROLE_CYCLE.length]!;

const roleEffortMultiplier: Record<UndulatingDayRole, number> = {
  heavy: 1.1,
  moderate: 1,
  light: 0.85,
};

export const planIntensityTarget = (
  input: WeekPlannerInput,
  weekType: PlannedProgrammeWeek['week_type'],
  intensityFactor: number,
  effortFactor: number,
  dayRole?: UndulatingDayRole,
): WeekPlanningMetadata['intensity_target'] => {
  const beginner =
    input.profile.athlete_state.training_status.value === 'beginner';
  const deficit = input.profile.source.nutrition?.calorie_status === 'deficit';
  const strength = input.strategy.primary_objective === 'strength';
  const hypertrophy = input.strategy.primary_objective === 'muscle_gain';
  const basePrimary = beginner ? 6 : strength ? 7.5 : 7;
  const deload = weekType === 'deload';
  const roleMultiplier = dayRole ? roleEffortMultiplier[dayRole] : 1;
  const target = Math.min(
    8.5,
    Math.max(
      5,
      basePrimary * effortFactor * roleMultiplier * (deload ? 0.95 : 1),
    ),
  );
  const maximum = Math.min(
    beginner || deficit ? 8 : 9,
    Math.max(target, target + 0.75),
  );

  return {
    rep_emphasis: dayRole
      ? dayRole === 'heavy'
        ? 'strength'
        : dayRole === 'light'
          ? 'high_rep_hypertrophy'
          : 'hypertrophy'
      : strength
        ? 'strength'
        : hypertrophy
          ? 'hypertrophy'
          : input.strategy.primary_objective === 'endurance'
            ? 'endurance_accessory'
            : 'mixed',
    loading_intent: deload
      ? 'light'
      : dayRole
        ? dayRole === 'heavy'
          ? 'heavy'
          : dayRole === 'light'
            ? 'technique'
            : 'moderate'
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
    // odin-programme-design-logic.md, Section 5: RIR/RPE validity and the
    // marginal-but-real failure effect are separate, cited claims — kept as
    // distinct citation codes so this rationale never implies more
    // certainty than either individually carries.
    rationale_codes: [
      'ZOURDOS_2016_RIR_VELOCITY_VALIDATION',
      'REFALO_2022_FAILURE_EFFECT',
      'GRGIC_2022_FAILURE_EFFECT',
    ],
  };
};
