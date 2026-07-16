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
  // An active joint/movement restriction on this exercise means reps and
  // ROM take priority over load (odin-programme-design-logic.md, Section 4
  // — heuristic, clinically standard, not a specific RCT): sit at the top
  // of the rep range rather than the goal-driven target, since there's no
  // load progression to hold reps low in reserve for.
  if (candidate.status === 'modifiable') {
    return max >= min
      ? max
      : candidate.exercise.default_rep_range.max;
  }
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

// Role-based defaults stay the base case: Schoenfeld et al. (2016,
// J Strength Cond Res) found 3-min rest outperformed 1-min for both
// strength AND hypertrophy outcomes on compound lifts even at hypertrophy
// rep ranges (8-12), so primary/secondary work should not get shorter
// rest just because the rep target sits in a "hypertrophy" zone.
//
// Load intent only overrides the role default at the true extremes,
// where the training goal clearly diverges from the role default's
// assumption: very heavy, low-rep work (NSCA strength/power guidance,
// Haff & Triplett, Essentials of Strength Training and Conditioning)
// needs more than the role default provides, and very high-rep metabolic
// work needs less, since full ATP-PC recovery isn't the point.
const HEAVY_REP_THRESHOLD = 5;
const HEAVY_REST_SECONDS = 210;
const HIGH_REP_THRESHOLD = 15;
const HIGH_REP_REST_SECONDS = 60;

export const restSeconds = (
  slot: MovementSlotV2,
  candidate: ExerciseCandidate,
  targetReps: number,
): number => {
  const roleDefault =
    slot.sequence_role === 'primary'
      ? 180
      : slot.sequence_role === 'secondary'
        ? 120
        : slot.sequence_role === 'isolation'
          ? 75
          : 90;
  const desired =
    targetReps <= HEAVY_REP_THRESHOLD
      ? Math.max(roleDefault, HEAVY_REST_SECONDS)
      : targetReps >= HIGH_REP_THRESHOLD
        ? Math.min(roleDefault, HIGH_REP_REST_SECONDS)
        : roleDefault;
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
  // An active restriction overrides the slot's normal progression policy
  // regardless of goal/periodization — reps/ROM stay the progression
  // variable and load never advances (odin-programme-design-logic.md,
  // Section 4; [Heuristic]).
  const progressionRule =
    candidate.status === 'modifiable'
      ? 'Movement restriction on file: hold load and progress reps/range of motion only. Do not increase load while this restriction remains active.'
      : input.week.planning_metadata.progression_policy.next_action.type ===
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

  // odin-programme-design-logic.md, Section 5: failure_exposure_policy was
  // previously descriptive-only — nothing ever varied a specific set's
  // ceiling because of it. This gives it an actual effect: the last set of
  // an eligible exercise gets its ceiling lifted to true failure (RPE 10),
  // not every set — "occasional", not routine, per the doc's practical
  // rule. An active movement restriction (Item 1) always wins: reps/ROM
  // priority means never pushing that exercise toward failure, regardless
  // of what failure_exposure_policy would otherwise allow.
  const lastSetIndex = slot.set_budget - 1;
  const failureExposurePolicy =
    input.week.planning_metadata.intensity_target.failure_exposure_policy;
  const failureExposureEligible =
    candidate.status !== 'modifiable' &&
    (failureExposurePolicy === 'last_set_optional' ||
      (failureExposurePolicy === 'limited_isolation_only' &&
        slot.sequence_role === 'isolation'));
  const rpeCeilingFor = (index: number): number =>
    failureExposureEligible && index === lastSetIndex ? 10 : slot.rpe_ceiling;

  return {
    prescription_id: `${input.calendar_day.day_id}-${slot.slot_id}`,
    exercise_id: candidate.exercise.id,
    exercise_name: candidate.exercise.display_name ?? candidate.exercise.name,
    display_order: displayOrder,
    // odin-programme-design-logic.md, Section 3: the deterministic planner
    // doesn't assign set-structure techniques (that logic lives in the AI
    // agent path only, for now) — straight sets are the doc's own safe
    // default, so this is an honest, not a placeholder, choice.
    set_structure: { type: 'straight', rationale_codes: [] },
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
      rpe_ceiling: rpeCeilingFor(index),
      rest_seconds: restSeconds(slot, candidate, targetReps),
    })),
    progression_bounds: {
      ...progressionBounds,
      load_increment_type:
        input.profile.source.equipment === 'bodyweight' ||
        candidate.status === 'modifiable'
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
    sequencing_rationale: [
      ...candidate.rationale_codes,
      ...(candidate.status === 'modifiable'
        ? ['INJURY_RESTRICTION_REPS_PRIORITY']
        : []),
      ...(failureExposureEligible ? ['FAILURE_EXPOSURE_LAST_SET'] : []),
    ],
    weight_kg: null,
  };
};
