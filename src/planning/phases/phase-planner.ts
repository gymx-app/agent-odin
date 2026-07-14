import { allocatePhaseLengths } from './phase-length-allocator.js';
import { phaseDirections } from './phase-policies.js';
import { buildPhaseSequence } from './phase-sequence-builder.js';
import { selectPlannedDeloadWeeks } from './deload-policy.js';
import { PHASE_DELOAD_ADJUSTMENTS } from '../fatigue/deload-adjustments.js';
import type {
  PhaseArchitecture,
  PhaseDecision,
  PhasePlannerInput,
  ProgrammePhasePlan,
} from './phase.types.js';

const decision = (
  code: string,
  selected_value: string,
  reason: string,
): PhaseDecision => ({
  code,
  selected_value,
  reason,
  source_fields: [
    'programme_horizon_weeks',
    'strategy.primary_objective',
    'strategy.fatigue_strategy',
  ],
  confidence: 'high',
});

export const planProgrammePhases = (
  input: PhasePlannerInput,
): ProgrammePhasePlan => {
  const templates = buildPhaseSequence(input);
  const lengths = allocatePhaseLengths(
    input.profile.programme_horizon_weeks,
    templates,
  );
  let startWeek = 1;
  const phases: PhaseArchitecture[] = templates.map((template, index) => {
    const weeks_count = lengths[index]!;
    const start_week = startWeek;
    const end_week = start_week + weeks_count - 1;
    startWeek = end_week + 1;
    return {
      phase_id: template.key,
      phase_number: index + 1,
      name: template.name,
      phase_type: template.phase_type,
      objective: template.objective,
      start_week,
      end_week,
      weeks_count,
      ...phaseDirections(
        template.phase_type,
        input.strategy.primary_objective,
        input.profile.athlete_state.training_status.value,
      ),
      progression_model: input.strategy.progression_model,
      rationale: [
        decision(template.rationale_code, template.name, template.objective),
      ],
    };
  });
  const planned_deload_weeks = selectPlannedDeloadWeeks(input, phases);
  const rationale_codes = phases.flatMap((phase) =>
    phase.rationale.map(({ code }) => code),
  );
  if (planned_deload_weeks.length > 0) {
    rationale_codes.push('DELOAD_ALIGNED_TO_PHASE_TRANSITION');
  }

  return {
    phases,
    planned_deload_weeks,
    fatigue_management_policy: {
      strategy: input.strategy.fatigue_strategy,
      planned_deload_weeks,
      deload_adjustments:
        planned_deload_weeks.length > 0 ? PHASE_DELOAD_ADJUSTMENTS : {},
      readiness_triggers:
        input.strategy.fatigue_strategy === 'readiness_triggered' ||
        input.strategy.fatigue_strategy === 'combined'
          ? [
              'Repeated performance decline.',
              'Persistent recovery deterioration.',
            ]
          : [],
      rationale:
        planned_deload_weeks.length > 0
          ? ['Deloads align with meaningful phase transitions.']
          : ['No planned deload is required by this architecture.'],
    },
    rationale_codes,
  };
};
