import { PlannerError } from '../planner-errors.js';
import { buildCalendarCandidates } from './calendar-candidate-builder.js';
import { evaluateCalendarConstraints } from './calendar-constraint-evaluator.js';
import {
  compareScoredCandidates,
  scoreCalendarCandidate,
} from './calendar-scorer.js';
import type {
  CalendarDecision,
  CalendarPlannerInput,
  PlannedCalendarResult,
  RejectedCalendarCandidate,
} from './calendar.types.js';

const decisionsForSelection = (
  input: CalendarPlannerInput,
  selectedId: string,
): CalendarDecision[] => {
  const inferred = !input.profile.source.schedule?.available_days;
  const decisions: CalendarDecision[] = [
    {
      code:
        input.strategy.cycle_length_days === 8
          ? 'ROLLING_SCHEDULE_SELECTED'
          : input.strategy.resistance_frequency === 3
            ? 'THREE_DAY_ALTERNATING_SELECTED'
            : input.strategy.resistance_frequency === 4
              ? 'FOUR_DAY_INTERLEAVED_SELECTED'
              : 'CALENDAR_CANDIDATE_SELECTED',
      selected_value: selectedId,
      reason: 'The highest-scoring valid deterministic calendar was selected.',
      source_fields: [
        'strategy.resistance_frequency',
        'strategy.cycle_length_days',
      ],
      confidence: inferred ? 'moderate' : 'high',
    },
  ];

  if (inferred) {
    decisions.push({
      code: 'CALENDAR_DAYS_INFERRED_FROM_FREQUENCY',
      selected_value: selectedId,
      reason: 'Explicit available weekdays were not supplied.',
      source_fields: ['available_days_per_week'],
      confidence: 'low',
    });
  }
  if (input.profile.recovery_capacity === 'low') {
    decisions.push({
      code: 'LOW_RECOVERY_SPACING_APPLIED',
      selected_value: selectedId,
      reason: 'Recovery capacity increased the score for distributed sessions.',
      source_fields: ['athlete_state.recovery_capacity'],
      confidence: input.profile.athlete_state.recovery_capacity.confidence,
    });
  }
  if ((input.profile.source.sport?.sessions_per_week ?? 0) > 0) {
    decisions.push({
      code: 'SPORT_DAY_PROTECTED',
      selected_value: selectedId,
      reason:
        'Reported sport sessions were inserted before resistance placement.',
      source_fields: ['sport.session_days', 'sport.priority'],
      confidence: input.profile.source.sport?.session_days ? 'high' : 'low',
    });
  }

  return decisions;
};

export const planTrainingCalendar = (
  input: CalendarPlannerInput,
): PlannedCalendarResult => {
  const candidates = buildCalendarCandidates(input);
  const rejected: RejectedCalendarCandidate[] = [];
  const valid = candidates.flatMap((candidate) => {
    const failures = evaluateCalendarConstraints(candidate, input);
    if (failures.length > 0) {
      rejected.push({ candidate_id: candidate.candidate_id, failures });
      return [];
    }
    return [scoreCalendarCandidate(candidate, input)];
  });

  if (valid.length === 0) {
    throw new PlannerError(
      'CALENDAR_UNSATISFIABLE',
      'No valid training calendar satisfies the supplied strategy and availability.',
      { rejected_candidates: rejected },
    );
  }

  const selected = [...valid].sort(compareScoredCandidates)[0]!;
  const decisions = decisionsForSelection(input, selected.candidate_id);

  return {
    calendar: {
      cycle_type: selected.cycle_type,
      cycle_length_days: selected.cycle_length_days,
      anchor_date: input.cycleAnchorDate,
      repeats: true,
      exceptions: selected.exceptions,
      days: selected.days.map((day) => ({
        cycle_day: day.cycle_day,
        ...(day.day_of_week ? { day_of_week: day.day_of_week } : {}),
        planned_session_type: day.session_type,
        session_label: day.session_label,
        session_kind: day.session_kind,
        ...(day.emphasis ? { emphasis: day.emphasis } : {}),
        demand_profile: day.demand_profile,
      })),
    },
    selected_candidate_id: selected.candidate_id,
    score: selected.score,
    rationale_codes: decisions.map((decision) => decision.code),
    decisions,
    exceptions: selected.exceptions,
    rejected_candidates: rejected,
  };
};
