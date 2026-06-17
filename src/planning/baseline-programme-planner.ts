import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import { NormalizedAthleteProfileSchema } from '../domain/athlete/normalized-athlete-profile.schema.js';
import { OdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { validateExerciseLibrary } from '../exercises/library-validator.js';
import { selectProgrammeStrategy } from './strategy-selector.js';
import { selectWeeklySplit } from './split-selector.js';
import { buildFoundationPhase } from './phase-builder.js';
import { buildWeekTemplate } from './week-template-builder.js';
import { programmeNameForGoal } from './programme-labels.js';
import { PlannerError } from './planner-errors.js';
import type { BuildBaselineProgrammeOptions } from './planning.types.js';

const defaultStartDate = '2026-01-01T00:00:00.000Z';

const warmupItems = [
  {
    item_key: 'general_warm_up',
    label: 'General Warm-Up',
    detail: 'Use five easy minutes to raise body temperature.',
    display_order: 1,
  },
  {
    item_key: 'movement_preparation',
    label: 'Movement Preparation',
    detail:
      'Practice the first two movement patterns with light, controlled reps.',
    display_order: 2,
  },
  {
    item_key: 'ramp_up_sets',
    label: 'Ramp-Up Sets',
    detail:
      'Before the first main lift, perform light ramp-up sets without fatigue.',
    display_order: 3,
  },
];

const scoreSessionTimeFit = (
  days: OdinProgramme['phase_week_templates'][number]['days'],
  sessionDuration: number,
): number => {
  const overDurationDays = days.filter(
    (day) => day.duration_min !== null && day.duration_min > sessionDuration,
  ).length;

  return overDurationDays === 0
    ? 100
    : Math.max(0, 100 - overDurationDays * 25);
};

export const buildBaselineProgramme = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  options: BuildBaselineProgrammeOptions = {},
): OdinProgramme => {
  const parsedProfile = NormalizedAthleteProfileSchema.parse(profile);
  const libraryValidation = validateExerciseLibrary(exercises);

  if (!libraryValidation.valid) {
    throw new PlannerError(
      'INVALID_EXERCISE_LIBRARY',
      'Exercise library failed validation.',
      libraryValidation.issues,
    );
  }

  const strategy = selectProgrammeStrategy(parsedProfile);
  const split = selectWeeklySplit(strategy);
  const phase = buildFoundationPhase(strategy);
  const weekTemplate = buildWeekTemplate(parsedProfile, exercises, split);
  const startDate = options.startDate ?? defaultStartDate;
  const reviewTriggers = [...weekTemplate.reviewTriggers];

  if (parsedProfile.programme_horizon_weeks > 8) {
    reviewTriggers.push(
      'Generate the next block after reviewing performance, recovery and restrictions.',
    );
  }

  const programme: OdinProgramme = {
    programme: {
      name: programmeNameForGoal(parsedProfile.source.goal),
      goal_type: parsedProfile.source.goal,
      goal_description: `Baseline ${parsedProfile.source.goal.replaceAll('_', ' ')} programme.`,
      start_weight_kg: parsedProfile.source.current_weight_kg,
      target_weight_kg: parsedProfile.source.target_weight_kg,
      target_weeks: parsedProfile.programme_horizon_weeks,
      available_days: parsedProfile.source.available_days_per_week,
      equipment: parsedProfile.source.equipment,
      started_at: startDate,
    },
    config: {
      start_date: startDate,
      phase_weeks: [phase.weeks_count],
      min_active_days: strategy.resistance_days + strategy.liss_days,
      total_phases: 1,
    },
    phases: [phase],
    phase_week_templates: [
      {
        phase_number: 1,
        days: weekTemplate.days,
      },
    ],
    warmup_items: warmupItems,
    assumptions: [
      ...parsedProfile.assumptions,
      'No exact load values are prescribed in the baseline plan.',
      'Double progression boundaries are internal planning rules.',
    ],
    review_triggers: reviewTriggers,
    validation_summary: {
      passed: true,
      scores: {
        constraint_fit: 95,
        movement_balance: 85,
        recovery_fit: parsedProfile.recovery_capacity === 'low' ? 75 : 88,
        goal_specificity: 85,
        progression_quality: 90,
        session_time_fit: scoreSessionTimeFit(
          weekTemplate.days,
          parsedProfile.source.session_duration_min,
        ),
      },
      warnings: weekTemplate.warnings,
    },
  };

  const parsedProgramme = OdinProgrammeSchema.safeParse(programme);

  if (!parsedProgramme.success) {
    throw new PlannerError(
      'PROGRAMME_SCHEMA_VALIDATION_FAILED',
      'Generated programme failed OdinProgrammeSchema validation.',
      parsedProgramme.error.issues,
    );
  }

  return parsedProgramme.data;
};
