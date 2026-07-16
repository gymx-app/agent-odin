import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { MovementSlot } from './planning.types.js';
import { PlannerError } from './planner-errors.js';
import { exerciseDisplayName } from './programme-labels.js';

export type SetPrescription =
  OdinProgramme['phase_week_templates'][number]['days'][number]['exercises'][number]['sets'][number];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const selectTargetReps = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
  status: 'eligible' | 'modifiable' = 'eligible',
): number => {
  // An active joint/movement restriction on this exercise means reps/ROM
  // take priority over load (odin-programme-design-logic.md, Section 4 —
  // heuristic, clinically standard, not a specific RCT): sit at the top of
  // the rep range regardless of goal, rather than the usual target.
  if (status === 'modifiable') {
    return slot.rep_zone.max;
  }

  if (slot.priority === 'accessory') {
    return profile.source.goal === 'strength' ? 12 : 15;
  }

  if (profile.source.goal === 'strength' && slot.priority === 'primary') {
    return clamp(slot.rep_zone.min, slot.rep_zone.min, slot.rep_zone.max);
  }

  if (profile.source.fitness_level === 'beginner') {
    return clamp(
      Math.floor((slot.rep_zone.min + slot.rep_zone.max) / 2),
      slot.rep_zone.min,
      slot.rep_zone.max,
    );
  }

  return clamp(
    Math.ceil((slot.rep_zone.min + slot.rep_zone.max) / 2),
    slot.rep_zone.min,
    slot.rep_zone.max,
  );
};

const restSecondsFor = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
): number => {
  if (slot.priority === 'primary') {
    return profile.source.goal === 'strength' ? 180 : 150;
  }

  if (slot.priority === 'secondary') {
    return 120;
  }

  return 75;
};

const rpeFor = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
): { target: number; ceiling: number } => {
  if (profile.source.fitness_level === 'beginner') {
    return { target: 6, ceiling: 7 };
  }

  if (profile.source.goal === 'strength' && slot.priority === 'primary') {
    return { target: 7.5, ceiling: 8 };
  }

  return { target: 7, ceiling: 8 };
};

export const createSetPrescriptions = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
  status: 'eligible' | 'modifiable' = 'eligible',
): SetPrescription[] => {
  const targetReps = selectTargetReps(profile, slot, status);
  const restSeconds = restSecondsFor(profile, slot);
  const rpe = rpeFor(profile, slot);

  if (targetReps < slot.rep_zone.min || targetReps > slot.rep_zone.max) {
    throw new PlannerError(
      'INVALID_SET_PRESCRIPTION',
      'Target reps fall outside progression bounds.',
      { slot },
    );
  }

  return Array.from({ length: slot.set_budget }, (_, index) => ({
    set_number: index + 1,
    target_reps: targetReps,
    target_rpe: rpe.target,
    rpe_ceiling: rpe.ceiling,
    rest_seconds: restSeconds,
    set_type: index === 0 ? 'calibration' : 'working',
  }));
};

export const createExercisePrescription = (
  profile: NormalizedAthleteProfile,
  slot: MovementSlot,
  exercise: Exercise,
  displayOrder: number,
  warnings: string[] = [],
  status: 'eligible' | 'modifiable' = 'eligible',
): OdinProgramme['phase_week_templates'][number]['days'][number]['exercises'][number] => ({
  display_order: displayOrder,
  exercise_id: exercise.id,
  exercise_name: exerciseDisplayName(exercise.name),
  tags: [...exercise.equipment, ...exercise.movement_patterns, slot.priority],
  coaching_cues: [
    'Choose a load expected to match the target reps at the target RPE.',
    'Stop the set if the RPE ceiling is exceeded.',
    ...exercise.coaching_notes,
  ],
  warnings,
  sets: createSetPrescriptions(profile, slot, status),
  progression_bounds: {
    rep_min: slot.rep_zone.min,
    rep_max: slot.rep_zone.max,
  },
  // A restriction on this exercise overrides the normal double-progression
  // rule regardless of goal (odin-programme-design-logic.md, Section 4 —
  // heuristic, clinically standard, not a specific RCT): reps/ROM stay the
  // progression variable and load never advances while it's active.
  progression_rule:
    status === 'modifiable'
      ? 'Movement restriction on file: hold load and progress reps/range of motion only. Do not increase load while this restriction remains active.'
      : 'If all prescribed sets are completed at or below the RPE ceiling, increase target reps next time until the top of the range; then increase load and reset to the lower rep bound. If minimum reps cannot be completed without exceeding the ceiling, maintain or reduce load.',
  equipment: exercise.equipment,
  movement_patterns: exercise.movement_patterns,
  primary_muscles: exercise.primary_muscles,
  secondary_muscles: exercise.secondary_muscles,
});
