import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateLongitudinalStrategy = (
  strategy: LongitudinalOdinProgramme['strategy'],
  calendar: LongitudinalOdinProgramme['calendar'],
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    message: string,
  ) =>
    findings.push(
      finding(
        validationCodes[code],
        severity,
        code === 'STRATEGY_CALENDAR_MISMATCH'
          ? 'constraint_fit'
          : 'goal_specificity',
        message,
      ),
    );
  const expectedObjective =
    profile.source.sport?.priority === 'primary'
      ? 'sport_support'
      : profile.source.goal;
  if (strategy.primary_objective !== expectedObjective) {
    add(
      'STRATEGY_GOAL_MISMATCH',
      'error',
      'Strategy objective does not match the stated goal or primary sport.',
    );
  }
  const resistanceCount = calendar.days.filter(
    (day) => day.planned_session_type === 'resistance',
  ).length;
  const conditioningCount = calendar.days.filter(
    (day) => day.planned_session_type === 'conditioning',
  ).length;
  if (
    strategy.resistance_frequency !== resistanceCount ||
    strategy.conditioning_frequency !== conditioningCount ||
    strategy.cycle_length_days !== calendar.cycle_length_days
  ) {
    add(
      'STRATEGY_CALENDAR_MISMATCH',
      'error',
      'Strategy frequencies or cycle length do not match the selected calendar.',
    );
  }
  const training = profile.athlete_state.training_status.value;
  if (
    training !== 'advanced' &&
    ['wave_loading', 'performance_based'].includes(strategy.progression_model)
  ) {
    add(
      'STRATEGY_TRAINING_STATUS_MISMATCH',
      'error',
      'Advanced progression is not justified by training status.',
    );
  }
  if (
    training === 'beginner' &&
    ['block', 'undulating', 'competition_peak'].includes(
      strategy.periodization_model,
    )
  ) {
    add(
      'PERIODIZATION_EXCESSIVE_FOR_TRAINING_STATUS',
      'warning',
      'Periodization complexity is excessive for beginner status.',
    );
  }
  if (
    profile.programme_horizon_weeks <= 6 &&
    ['block', 'undulating', 'competition_peak'].includes(
      strategy.periodization_model,
    )
  ) {
    add(
      'PERIODIZATION_EXCESSIVE_FOR_HORIZON',
      'warning',
      'Periodization complexity is excessive for the programme horizon.',
    );
  }
  if (
    profile.recovery_capacity === 'low' &&
    (strategy.volume_strategy === 'high' ||
      (strategy.split_type === 'push_pull_legs' &&
        strategy.resistance_frequency === 6))
  ) {
    add(
      'STRATEGY_RECOVERY_MISMATCH',
      'error',
      'Strategy density or volume conflicts with low recovery capacity.',
    );
  }
  if (
    strategy.periodization_model === 'competition_peak' &&
    !profile.source.sport?.competition_date
  ) {
    add(
      'COMPETITION_PHASE_DATE_MISMATCH',
      'error',
      'Competition peak requires a dated competition target.',
    );
  }

  return findings;
};
