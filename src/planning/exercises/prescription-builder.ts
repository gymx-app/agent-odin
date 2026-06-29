import type {
  ExerciseCandidate,
  ExercisePrescription,
  MovementSlotV2,
  ResistanceSessionBuilderInput,
} from '../sessions/session.types.js';
import { buildSubstitutionOptions } from './substitution-group-builder.js';

const exactReps = (
  input: ResistanceSessionBuilderInput,
  slot: MovementSlotV2,
  candidate: ExerciseCandidate,
): number => {
  const min = Math.max(
    slot.rep_zone.min,
    candidate.exercise.default_rep_range.min,
  );
  const max = Math.min(
    slot.rep_zone.max,
    candidate.exercise.default_rep_range.max,
  );
  if (max < min) {
    return input.strategy.primary_objective === 'strength' &&
      slot.sequence_role === 'primary'
      ? candidate.exercise.default_rep_range.min
      : Math.round(
          (candidate.exercise.default_rep_range.min +
            candidate.exercise.default_rep_range.max) /
            2,
        );
  }
  if (
    input.strategy.primary_objective === 'strength' &&
    slot.sequence_role === 'primary'
  ) {
    return Math.max(min, Math.min(max, 5));
  }
  return Math.max(min, Math.min(max, Math.round((min + max) / 2)));
};

const restSeconds = (
  slot: MovementSlotV2,
  candidate: ExerciseCandidate,
): number => {
  const desired =
    slot.sequence_role === 'primary'
      ? 180
      : slot.sequence_role === 'secondary'
        ? 120
        : slot.sequence_role === 'isolation'
          ? 75
          : 90;
  return Math.max(
    candidate.exercise.default_rest_seconds.min,
    Math.min(candidate.exercise.default_rest_seconds.max, desired),
  );
};

export const buildExactPrescription = (
  input: ResistanceSessionBuilderInput,
  slot: MovementSlotV2,
  candidate: ExerciseCandidate,
  displayOrder: number,
): ExercisePrescription => {
  const targetReps = exactReps(input, slot, candidate);
  const setType = (index: number): 'working' | 'backoff' | 'calibration' => {
    if (
      index === 0 &&
      (input.week.week_type === 'introduction' ||
        input.profile.athlete_state.training_status.value === 'returning')
    ) {
      return 'calibration';
    }
    if (
      index === slot.set_budget - 1 &&
      slot.sequence_role === 'primary' &&
      input.strategy.primary_objective === 'strength' &&
      input.phase.phase_type === 'intensification'
    ) {
      return 'backoff';
    }
    return 'working';
  };
  const progressionRule =
    input.week.planning_metadata.progression_policy.next_action.type ===
    'increase_reps'
      ? 'Increase target reps by one after completing all prescribed sets at or below the RPE ceiling.'
      : input.week.planning_metadata.progression_policy.next_action.type ===
          'increase_load'
        ? 'Increase load by the smallest available increment after completing all prescribed sets at or below the RPE ceiling.'
        : 'Maintain the prescription while all sets remain within the RPE ceiling.';
  const intersectedRepMin = Math.max(
    slot.rep_zone.min,
    candidate.exercise.default_rep_range.min,
  );
  const intersectedRepMax = Math.min(
    slot.rep_zone.max,
    candidate.exercise.default_rep_range.max,
  );
  const progressionBounds =
    intersectedRepMax >= intersectedRepMin
      ? { rep_min: intersectedRepMin, rep_max: intersectedRepMax }
      : {
          rep_min: candidate.exercise.default_rep_range.min,
          rep_max: candidate.exercise.default_rep_range.max,
        };

  return {
    prescription_id: `${input.calendar_day.day_id}-${slot.slot_id}`,
    exercise_id: candidate.exercise.id,
    exercise_name: candidate.exercise.display_name ?? candidate.exercise.name,
    display_order: displayOrder,
    sequence_role: slot.sequence_role,
    priority: slot.priority,
    tags: [
      ...candidate.exercise.equipment,
      ...candidate.exercise.movement_patterns,
      slot.sequence_role,
    ],
    coaching_cues: candidate.exercise.coaching_notes.slice(0, 3),
    warnings: candidate.warnings,
    sets: Array.from({ length: slot.set_budget }, (_, index) => ({
      set_number: index + 1,
      set_type: setType(index),
      target_reps: targetReps,
      target_rpe: slot.target_rpe,
      rpe_ceiling: slot.rpe_ceiling,
      rest_seconds: restSeconds(slot, candidate),
    })),
    progression_bounds: {
      ...progressionBounds,
      load_increment_type:
        input.profile.source.equipment === 'bodyweight'
          ? 'none'
          : 'smallest_available',
    },
    progression_rule_id: slot.progression_policy_id,
    ...buildSubstitutionOptions(input, slot, candidate),
    user_progression_rule: progressionRule,
    ...(candidate.status === 'modifiable'
      ? {
          modification_metadata: {
            required: true,
            cues: candidate.warnings,
            restriction_tags: candidate.restriction_tags,
          },
        }
      : {}),
    equipment: candidate.exercise.equipment,
    movement_patterns: candidate.exercise.movement_patterns,
    primary_muscles: candidate.exercise.primary_muscles,
    secondary_muscles: candidate.exercise.secondary_muscles,
    sequencing_rationale: candidate.rationale_codes,
  };
};
