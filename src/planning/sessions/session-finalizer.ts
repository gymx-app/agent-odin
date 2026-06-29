import type { WarmupItem } from '../warmup/warmup.types.js';
import { PlannerError } from '../planner-errors.js';
import { sequenceSessionExercises } from '../sequencing/exercise-sequencer.js';
import { planSessionWarmup } from '../warmup/warmup-planner.js';
import { estimateWarmupItemSeconds } from '../warmup/warmup.types.js';
import { planSessionCooldown } from '../cooldown/cooldown-planner.js';
import { estimateResistanceSessionDuration } from './session-duration-estimator.js';
import type {
  PlannedResistanceSession,
  ResistanceSessionBuilderInput,
} from './session.types.js';

const warmupDuration = (items: WarmupItem[]): number =>
  items.reduce((sum, item) => sum + estimateWarmupItemSeconds(item), 0);

const repairWarmup = (items: WarmupItem[]): WarmupItem[] => {
  const essential = items.filter(
    (item) =>
      ['movement_rehearsal', 'ramp_up_set'].includes(item.component_type) ||
      item.rationale_codes.includes('CLINICIAN_MOBILITY_REQUIREMENT_APPLIED'),
  );
  const pulse = items.find((item) => item.component_type === 'pulse_raiser');
  const repairedPulse = pulse
    ? {
        ...pulse,
        duration_seconds: Math.min(pulse.duration_seconds ?? 60, 60),
        rationale_codes: [
          ...new Set([
            ...pulse.rationale_codes,
            'PULSE_RAISER_SHORTENED_FOR_DURATION',
          ]),
        ],
      }
    : undefined;

  return [...(repairedPulse ? [repairedPulse] : []), ...essential]
    .filter(
      (item, index, all) =>
        all.findIndex((candidate) => candidate.warmup_id === item.warmup_id) ===
        index,
    )
    .map((item, index) => ({ ...item, display_order: index + 1 }));
};

export const finalizeResistanceSession = (
  input: ResistanceSessionBuilderInput,
  session: PlannedResistanceSession,
): PlannedResistanceSession => {
  let warmup = planSessionWarmup({
    profile: input.profile,
    session,
    exercises: input.exercises,
  });
  const cooldown = planSessionCooldown({
    profile: input.profile,
    session,
    exercises: input.exercises,
  });
  const sequence = sequenceSessionExercises({
    profile: input.profile,
    session,
    exercises: input.exercises,
    warmup,
  });
  let duration = estimateResistanceSessionDuration(input, sequence.exercises, {
    warmupDurationSeconds: warmup.duration_seconds,
  });
  let repaired = false;

  if (
    duration.estimated_duration_min > input.profile.source.session_duration_min
  ) {
    repaired = true;
    const items = repairWarmup(warmup.items);
    warmup = {
      items,
      duration_seconds: warmupDuration(items),
      compressed_for_duration: true,
      rationale_codes: [
        ...new Set([
          ...items.flatMap((item) => item.rationale_codes),
          'WARMUP_COMPRESSED_FOR_SESSION_LIMIT',
        ]),
      ],
    };
    duration = estimateResistanceSessionDuration(input, sequence.exercises, {
      warmupDurationSeconds: warmup.duration_seconds,
    });
  }

  if (
    duration.estimated_duration_min > input.profile.source.session_duration_min
  ) {
    throw new PlannerError(
      'SESSION_FINALIZATION_FAILED',
      'Warm-up and sequence cannot fit the session duration after one repair pass.',
      {
        duration,
        maximum: input.profile.source.session_duration_min,
      },
    );
  }

  const rationaleCodes = [
    ...new Set([
      ...session.rationale_codes,
      ...warmup.rationale_codes,
      ...sequence.rationale_codes,
      ...(repaired ? ['SESSION_FINALIZATION_REPAIRED'] : []),
    ]),
  ];

  return {
    ...session,
    selected_exercise_ids: sequence.exercises.map(
      (exercise) => exercise.exercise_id,
    ),
    rationale_codes: rationaleCodes,
    duration,
    day: {
      ...session.day,
      warmup: warmup.items,
      cooldown: cooldown.items,
      exercises: sequence.exercises,
      estimated_duration_min: duration.estimated_duration_min,
      training_budget: session.day.training_budget
        ? {
            ...session.day.training_budget,
            estimated_duration_min: duration.estimated_duration_min,
          }
        : undefined,
      session_metadata: session.day.session_metadata
        ? {
            ...session.day.session_metadata,
            rationale_codes: rationaleCodes,
            sequence_exceptions: sequence.sequence_exceptions,
            duration_breakdown: {
              working_time_min: duration.working_time_min,
              rest_time_min: duration.rest_time_min,
              setup_transition_min: duration.setup_transition_min,
              warmup_allowance_min: duration.warmup_allowance_min,
              cooldown_allowance_min: duration.cooldown_allowance_min,
            },
          }
        : undefined,
    },
  };
};
