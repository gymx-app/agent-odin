import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateLongitudinalPhases = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    message: string,
    phase_number: number | null = null,
  ) =>
    findings.push(
      finding(
        validationCodes[code],
        severity,
        code.includes('DELOAD') ? 'fatigue_management' : 'progression_quality',
        message,
        { phase_number },
      ),
    );

  programme.phases.forEach((phase, index) => {
    const previous = programme.phases[index - 1];
    if (phase.end_week < phase.start_week || phase.weeks_count < 1) {
      add(
        'PHASE_DURATION_INVALID',
        'error',
        'Phase has invalid duration or boundaries.',
        phase.phase_number,
      );
    }
    if (!phase.objective.trim()) {
      add(
        'PHASE_OBJECTIVE_MISSING',
        'error',
        'Phase objective is required.',
        phase.phase_number,
      );
    }
    if (previous && phase.start_week > previous.end_week + 1) {
      add(
        'PHASE_BOUNDARY_GAP',
        'error',
        'Programme contains a gap between phase boundaries.',
        phase.phase_number,
      );
    }
    if (previous && phase.start_week <= previous.end_week) {
      add(
        'PHASE_BOUNDARY_OVERLAP',
        'error',
        'Programme contains overlapping phase boundaries.',
        phase.phase_number,
      );
    }
    if (
      phase.phase_type === 'recovery' &&
      (phase.volume_direction !== 'decrease' ||
        phase.effort_direction !== 'decrease')
    ) {
      add(
        'PHASE_DIRECTION_INCOHERENT',
        'error',
        'Recovery phase must reduce volume and effort.',
        phase.phase_number,
      );
    }
    if (
      phase.phase_type === 'intensification' &&
      phase.intensity_direction !== 'increase'
    ) {
      add(
        'PHASE_DIRECTION_INCOHERENT',
        'warning',
        'Intensification phase should increase intensity.',
        phase.phase_number,
      );
    }
    if (
      phase.phase_type === 'realization' &&
      programme.strategy.primary_objective !== 'strength' &&
      programme.strategy.primary_objective !== 'sport_support'
    ) {
      add(
        'UNJUSTIFIED_REALIZATION_PHASE',
        'warning',
        'Realization phase is not justified by the programme objective.',
        phase.phase_number,
      );
    }
    if (phase.name === 'Testing' && !profile.source.sport?.competition_date) {
      add(
        'UNJUSTIFIED_TESTING_PHASE',
        'warning',
        'Testing phase lacks a dated performance target.',
        phase.phase_number,
      );
    }
  });

  const finalPhase = programme.phases.at(-1);
  if (
    programme.phases[0]?.start_week !== 1 ||
    finalPhase?.end_week !== programme.programme.target_weeks
  ) {
    add(
      'INVALID_PHASE_SEQUENCE',
      'error',
      'Phase sequence must allocate the complete programme horizon.',
    );
  }
  const deloads = programme.fatigue_management_policy.planned_deload_weeks;
  if (
    programme.fatigue_management_policy.strategy === 'none' &&
    deloads.length > 0
  ) {
    add(
      'DELOAD_STRATEGY_MISMATCH',
      'error',
      'No-deload strategy cannot contain planned deload weeks.',
    );
  }
  deloads.forEach((week) => {
    if (week <= 1 || week > programme.programme.target_weeks) {
      add(
        'DELOAD_PLACEMENT_INVALID',
        'error',
        'Planned deload week is outside a valid transition.',
      );
    }
  });
  if (
    deloads.length > 0 &&
    programme.programme.target_weeks <= 4 &&
    profile.athlete_state.training_status.value === 'beginner'
  ) {
    add(
      'UNJUSTIFIED_DELOAD',
      'warning',
      'Very short beginner programme may not require a planned deload.',
    );
  }

  return findings;
};
