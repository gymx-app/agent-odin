import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { WeekSession } from './planning.types.js';
import { DAYS_OF_WEEK } from '../domain/shared/domain-enums.js';
import { buildMovementSlotsForSession } from './movement-slot-builder.js';
import { fillMovementSlot } from './exercise-slot-filler.js';
import { createExercisePrescription } from './prescription-allocator.js';
import { estimateWorkoutDurationMinutes } from './session-duration-estimator.js';
import { workoutTitle } from './programme-labels.js';
import { PlannerError } from './planner-errors.js';

type DayTemplate =
  OdinProgramme['phase_week_templates'][number]['days'][number];
type Warning = OdinProgramme['validation_summary']['warnings'][number];

const cooldownItems = [
  {
    item_key: 'easy_walk',
    label: 'Easy Walk',
    detail: 'Walk easily until breathing settles.',
    display_order: 1,
  },
  {
    item_key: 'breathing_reset',
    label: 'Breathing Reset',
    detail: 'Use slow nasal breathing for two minutes.',
    display_order: 2,
  },
  {
    item_key: 'light_mobility',
    label: 'Light Mobility',
    detail: 'Move through comfortable ranges without forcing end positions.',
    display_order: 3,
  },
];

const lissDuration = (profile: NormalizedAthleteProfile): number =>
  Math.min(profile.source.session_duration_min, 45);

const createLissDay = (
  profile: NormalizedAthleteProfile,
  session: WeekSession,
  dayIndex: number,
): DayTemplate => ({
  day_of_week: DAYS_OF_WEEK[dayIndex]!,
  workout_type: 'liss',
  title: workoutTitle(session),
  subtitle: 'Conversational pace aerobic work.',
  duration_min: lissDuration(profile),
  tags: ['liss', 'conversational_pace'],
  has_warmup: false,
  liss_content: `${lissDuration(profile)} minutes at conversational pace, approximately 60 to 70 percent estimated maximum heart rate. Do not chase calorie burn.`,
  cooldown_items: cooldownItems,
  exercises: [],
});

const createRestDay = (
  session: WeekSession,
  dayIndex: number,
): DayTemplate => ({
  day_of_week: DAYS_OF_WEEK[dayIndex]!,
  workout_type: 'rest',
  title: workoutTitle(session),
  subtitle: 'No planned training.',
  duration_min: null,
  tags: ['rest'],
  has_warmup: false,
  liss_content: null,
  cooldown_items: [],
  exercises: [],
});

const reducePrescriptionsToFit = (
  prescriptions: DayTemplate['exercises'],
  exercises: Exercise[],
  durationLimit: number,
): DayTemplate['exercises'] => {
  let reduced = [...prescriptions];

  while (
    estimateWorkoutDurationMinutes(reduced, exercises) > durationLimit &&
    reduced.some((prescription) => prescription.tags.includes('accessory'))
  ) {
    const lastAccessoryIndex = reduced.reduce(
      (lastIndex, prescription, index) =>
        prescription.tags.includes('accessory') ? index : lastIndex,
      -1,
    );

    reduced = reduced.filter(
      (_prescription, index) => index !== lastAccessoryIndex,
    );
  }

  if (estimateWorkoutDurationMinutes(reduced, exercises) <= durationLimit) {
    return reduced;
  }

  reduced = reduced.map((prescription) => {
    if (
      !prescription.tags.includes('primary') &&
      prescription.sets.length > 2
    ) {
      return {
        ...prescription,
        sets: prescription.sets.slice(0, 2),
      };
    }

    return prescription;
  });

  if (estimateWorkoutDurationMinutes(reduced, exercises) <= durationLimit) {
    return reduced;
  }

  reduced = reduced.map((prescription) => {
    if (prescription.sets.length > 2) {
      return {
        ...prescription,
        sets: prescription.sets.slice(0, 2),
      };
    }

    return prescription;
  });

  if (estimateWorkoutDurationMinutes(reduced, exercises) <= durationLimit) {
    return reduced;
  }

  throw new PlannerError(
    'SESSION_DURATION_UNSATISFIABLE',
    'Workout cannot fit the available session duration while preserving required slots.',
    { durationLimit },
  );
};

const createWorkoutDay = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  session: WeekSession,
  dayIndex: number,
  warnings: Warning[],
  reviewTriggers: string[],
  recentlySelectedExerciseIds: string[],
): DayTemplate => {
  const slots = buildMovementSlotsForSession(session.kind);
  const selectedExerciseIds = [...recentlySelectedExerciseIds];
  const filledSlots = slots.flatMap((slot) => {
    try {
      const filledSlot = fillMovementSlot(
        slot,
        profile,
        exercises,
        selectedExerciseIds,
      );
      selectedExerciseIds.push(filledSlot.exercise.id);
      return [filledSlot];
    } catch (error) {
      if (error instanceof PlannerError && !slot.required) {
        return [];
      }

      if (error instanceof PlannerError) {
        throw new PlannerError(
          'REQUIRED_MOVEMENT_SLOT_UNFILLED',
          `Required movement slot ${slot.movement_pattern} could not be filled.`,
          { slot, cause: error.details },
        );
      }

      throw error;
    }
  });

  filledSlots.forEach((filledSlot) => {
    recentlySelectedExerciseIds.push(filledSlot.exercise.id);

    if (filledSlot.status === 'modifiable') {
      warnings.push({
        code: 'MODIFIABLE_EXERCISE_SELECTED',
        severity: 'warning',
        message: `${filledSlot.exercise.name} was selected as a modifiable fallback.`,
      });
      reviewTriggers.push(
        `Review ${filledSlot.exercise.name} because it was selected as a modifiable fallback.`,
      );
    }
  });

  const prescriptions = filledSlots.map((filledSlot, index) =>
    createExercisePrescription(
      profile,
      filledSlot.slot,
      filledSlot.exercise,
      index + 1,
      filledSlot.warnings,
    ),
  );
  const reducedPrescriptions = reducePrescriptionsToFit(
    prescriptions,
    exercises,
    profile.source.session_duration_min,
  );

  return {
    day_of_week: DAYS_OF_WEEK[dayIndex]!,
    workout_type: 'workout',
    title: workoutTitle(session),
    subtitle: 'Exact reps, RPE targets and rest are prescribed.',
    duration_min: estimateWorkoutDurationMinutes(
      reducedPrescriptions,
      exercises,
    ),
    tags: ['resistance', session.kind],
    has_warmup: true,
    liss_content: null,
    cooldown_items: cooldownItems,
    exercises: reducedPrescriptions,
  };
};

export const buildWeekTemplate = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  sessions: WeekSession[],
): {
  days: DayTemplate[];
  warnings: Warning[];
  reviewTriggers: string[];
} => {
  const warnings: Warning[] = [];
  const reviewTriggers: string[] = [];
  const recentlySelectedExerciseIds: string[] = [];

  const days = sessions.map((session, dayIndex) => {
    if (session.kind === 'liss') {
      return createLissDay(profile, session, dayIndex);
    }

    if (session.kind === 'rest') {
      return createRestDay(session, dayIndex);
    }

    return createWorkoutDay(
      profile,
      exercises,
      session,
      dayIndex,
      warnings,
      reviewTriggers,
      recentlySelectedExerciseIds,
    );
  });

  return {
    days,
    warnings,
    reviewTriggers,
  };
};
