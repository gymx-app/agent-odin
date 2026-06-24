import { PlannerError } from '../planner-errors.js';
import { buildExactPrescription } from '../exercises/prescription-builder.js';
import { selectExerciseForSlot } from '../exercises/exercise-selector.js';
import { planMovementSlotsV2 } from './movement-slot-planner.js';
import {
  canonicalSessionTitle,
  sessionObjective,
} from './session-objective-builder.js';
import { estimateResistanceSessionDuration } from './session-duration-estimator.js';
import { finalizeResistanceSession } from './session-finalizer.js';
import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import type {
  ExercisePrescription,
  PlannedResistanceSession,
  ResistanceSessionBuilderInput,
  SessionKind,
} from './session.types.js';

const resolveSessionKind = (
  input: ResistanceSessionBuilderInput,
): SessionKind => {
  const label = input.calendar_day.title.toLowerCase();
  if (label.includes('full body')) return 'full_body';
  if (label.includes('upper')) return 'upper';
  if (label.includes('lower')) return 'lower';
  if (label.includes('push')) return 'push';
  if (label.includes('pull')) return 'pull';
  if (label.includes('legs')) return 'legs';
  return input.strategy.split_type === 'sport_support'
    ? 'sport_support'
    : input.strategy.split_type === 'specialized'
      ? 'specialized'
      : input.strategy.split_type === 'full_body'
        ? 'full_body'
        : input.strategy.split_type === 'push_pull_legs'
          ? 'push'
          : input.strategy.split_type === 'upper_lower'
            ? 'upper'
            : 'full_body';
};

const buildPrescriptions = (
  input: ResistanceSessionBuilderInput,
  slots: ReturnType<typeof planMovementSlotsV2>['slots'],
): { prescriptions: ExercisePrescription[]; rationale: string[] } => {
  const selectedIds = new Set<string>();
  const prescriptions: ExercisePrescription[] = [];
  const rationale: string[] = [];

  slots.forEach((slot) => {
    const selected = selectExerciseForSlot(input, slot, selectedIds);
    if (!selected) {
      rationale.push(
        slot.required
          ? 'REQUIRED_SLOT_DROPPED_NO_ELIGIBLE_EXERCISE'
          : 'OPTIONAL_SLOT_DROPPED',
      );
      return;
    }
    selectedIds.add(selected.exercise.id);
    prescriptions.push(
      buildExactPrescription(input, slot, selected, prescriptions.length + 1),
    );
    rationale.push(...selected.rationale_codes);
  });
  return { prescriptions, rationale };
};

export const buildResistanceSession = (
  input: ResistanceSessionBuilderInput,
): PlannedResistanceSession => {
  if (input.calendar_day.day_type !== 'resistance') {
    throw new PlannerError(
      'SESSION_MOVEMENT_COVERAGE_IMPOSSIBLE',
      'Session Construction V2 accepts resistance days only.',
    );
  }
  const sessionKind = resolveSessionKind(input);
  const slotPlan = planMovementSlotsV2(input, sessionKind);
  if (slotPlan.slots.length === 0) {
    throw new PlannerError(
      'SESSION_MOVEMENT_COVERAGE_IMPOSSIBLE',
      'Session budget cannot preserve required movement coverage.',
    );
  }
  let activeSlots = [...slotPlan.slots];
  let built = buildPrescriptions(input, activeSlots);
  let duration = estimateResistanceSessionDuration(input, built.prescriptions);
  const rationale = [...slotPlan.rationale_codes, ...built.rationale];
  const maximum = input.profile.source.session_duration_min;

  while (duration.estimated_duration_min > maximum) {
    const optionalIndex = [...activeSlots]
      .map((slot, index) => ({ slot, index }))
      .reverse()
      .find(({ slot }) => !slot.required)?.index;
    if (optionalIndex !== undefined) {
      activeSlots.splice(optionalIndex, 1);
      rationale.push('OPTIONAL_SLOT_REMOVED_FOR_DURATION');
    } else {
      const accessory = [...activeSlots]
        .reverse()
        .find(
          (slot) => slot.sequence_role !== 'primary' && slot.set_budget > 1,
        );
      if (accessory) {
        accessory.set_budget -= 1;
        rationale.push('ACCESSORY_VOLUME_REDUCED_FOR_DURATION');
      } else {
        const primary = [...activeSlots]
          .reverse()
          .find((slot) => slot.required && slot.set_budget > 1);
        if (!primary) break;
        primary.set_budget -= 1;
        rationale.push('PRIMARY_VOLUME_REDUCED_FOR_DURATION');
      }
    }
    built = buildPrescriptions(input, activeSlots);
    duration = estimateResistanceSessionDuration(input, built.prescriptions);
  }

  const droppedRequiredSlots = new Set(
    built.rationale.includes('REQUIRED_SLOT_DROPPED_NO_ELIGIBLE_EXERCISE')
      ? activeSlots
          .filter(
            (slot) =>
              slot.required &&
              !built.prescriptions.some((p) =>
                p.movement_patterns.some(
                  (pat) =>
                    pat === slot.movement_pattern ||
                    slot.allowed_substitution_patterns.includes(pat as never),
                ),
              ),
          )
          .map((s) => s.slot_id)
      : [],
  );

  if (
    duration.estimated_duration_min > maximum ||
    activeSlots
      .filter((slot) => slot.required && !droppedRequiredSlots.has(slot.slot_id))
      .some(
        (slot) =>
          !built.prescriptions.some((prescription) =>
            prescription.movement_patterns.some(
              (pattern) =>
                pattern === slot.movement_pattern ||
                slot.allowed_substitution_patterns.includes(pattern as never),
            ),
          ),
      )
  ) {
    throw new PlannerError(
      'SESSION_DURATION_REPAIR_FAILED',
      'Required session coverage cannot fit the duration limit.',
      { duration, maximum },
    );
  }
  if (rationale.some((code) => code.includes('DURATION'))) {
    rationale.push('SESSION_DURATION_REPAIRED');
  }
  rationale.push('SESSION_VOLUME_BUDGET_SATISFIED');
  const objective = sessionObjective(input);

  return {
    day: {
      ...input.calendar_day,
      title: canonicalSessionTitle(sessionKind),
      subtitle: objective,
      estimated_duration_min: duration.estimated_duration_min,
      maximum_duration_min: maximum,
      fatigue_classification: input.session_budget.fatigue_ceiling,
      movement_emphasis: activeSlots.map((slot) => slot.movement_pattern),
      exercises: built.prescriptions,
      training_budget: {
        ...input.session_budget,
        total_working_set_budget: built.prescriptions.reduce(
          (sum, prescription) => sum + prescription.sets.length,
          0,
        ),
        estimated_duration_min: duration.estimated_duration_min,
      },
      session_metadata: {
        session_id: `session-${input.week.week_number}-${input.calendar_day.cycle_day}`,
        session_kind: sessionKind,
        objective,
        phase_objective: input.phase.objective,
        rationale_codes: [...new Set(rationale)],
        duration_breakdown: {
          working_time_min: duration.working_time_min,
          rest_time_min: duration.rest_time_min,
          setup_transition_min: duration.setup_transition_min,
          warmup_allowance_min: duration.warmup_allowance_min,
          cooldown_allowance_min: duration.cooldown_allowance_min,
        },
      },
    },
    week_type: input.week.week_type,
    strategy: input.strategy,
    movement_slots: activeSlots,
    selected_exercise_ids: built.prescriptions.map(
      (prescription) => prescription.exercise_id,
    ),
    rationale_codes: [...new Set(rationale)],
    duration,
  };
};

export const buildProgrammeResistanceSessions = (input: {
  profile: NormalizedAthleteProfile;
  strategy: LongitudinalOdinProgramme['strategy'];
  phases: LongitudinalOdinProgramme['phases'];
  exercises: Exercise[];
}): LongitudinalOdinProgramme['phases'] => {
  const continuityByCycleDay = new Map<
    number,
    NonNullable<ResistanceSessionBuilderInput['prior_programme_context']>
  >();

  return input.phases.map((phase) => ({
    ...phase,
    weeks: phase.weeks.map((week) => ({
      ...week,
      days: week.days.map((day) => {
        if (day.day_type !== 'resistance' || !day.training_budget) return day;
        const priorContext = continuityByCycleDay.get(day.cycle_day);
        const builderInput = {
          profile: input.profile,
          strategy: input.strategy,
          phase,
          week,
          calendar_day: day,
          session_budget: day.training_budget,
          exercises: input.exercises,
          ...(priorContext ? { prior_programme_context: priorContext } : {}),
        };
        const constructed = buildResistanceSession(builderInput);
        const result = finalizeResistanceSession(builderInput, constructed);
        continuityByCycleDay.set(day.cycle_day, {
          phase_id: phase.phase_id,
          by_slot_id: Object.fromEntries(
            constructed.movement_slots.map((slot, index) => [
              slot.slot_id,
              constructed.selected_exercise_ids[index]!,
            ]),
          ),
        });
        return result.day;
      }),
    })),
  }));
};
