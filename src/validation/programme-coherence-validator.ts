import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateProgrammeCoherence = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    message: string,
    metadata: Record<string, unknown> = {},
  ) =>
    findings.push(
      finding(validationCodes[code], severity, 'goal_specificity', message, {
        metadata,
      }),
    );

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) => {
      const resistanceCount = week.days.filter((day) =>
        ['resistance', 'combined'].includes(day.day_type),
      ).length;
      if (resistanceCount !== programme.strategy.resistance_frequency) {
        add(
          'STRATEGY_PROGRAMME_MISMATCH',
          'error',
          'Weekly resistance frequency does not execute the selected strategy.',
          { phase_id: phase.phase_id, week_number: week.week_number },
        );
      }
      if (phase.phase_type === 'recovery' && week.week_type === 'overload') {
        add(
          'PHASE_WEEK_MISMATCH',
          'error',
          'Recovery phase contains an overload week.',
          { phase_id: phase.phase_id, week_number: week.week_number },
        );
      }
      const conditioningCount = week.days.filter(
        (day) =>
          day.day_type !== 'resistance' &&
          day.conditioning.some(
            (item) => item.conditioning_type !== 'sport_conditioning',
          ),
      ).length;
      if (
        conditioningCount !==
        programme.conditioning_policy.weekly_target_sessions
      ) {
        add(
          'CONDITIONING_POLICY_EXECUTION_MISMATCH',
          'error',
          'Weekly conditioning does not execute its policy target.',
          { week_number: week.week_number },
        );
      }
    }),
  );
  if (
    profile.source.sport?.priority === 'primary' &&
    programme.conditioning_policy.concurrent_training_priority === 'resistance'
  ) {
    add(
      'SPORT_PRIORITY_EXECUTION_MISMATCH',
      'error',
      'Primary sport priority is contradicted by resistance-first concurrent policy.',
    );
  }
  if (
    programme.strategy.primary_objective !== profile.source.goal &&
    !(
      profile.source.sport?.priority === 'primary' &&
      programme.strategy.primary_objective === 'sport_support'
    )
  ) {
    add(
      'PROGRAMME_OBJECTIVE_EXECUTION_MISMATCH',
      'error',
      'Programme objective does not match the athlete objective.',
    );
  }
  return findings;
};
