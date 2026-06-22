import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { ProgrammeValidationFinding } from '../../validation/validation.types.js';
import { longitudinalValidationRules } from '../../validation/longitudinal-validation-registry.js';

const PER_PHASE_RULE_IDS = new Set([
  'phases',
  'weeks',
  'sessions',
  'warmups',
  'exercise-sequencing',
  'conditioning',
]);

export type PhaseIsolationInput = {
  programme: LongitudinalOdinProgramme;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
  phaseIndex: number;
};

export const validatePhaseInIsolation = (
  input: PhaseIsolationInput,
): ProgrammeValidationFinding[] => {
  const { programme, profile, exercises, phaseIndex } = input;
  const phase = programme.phases[phaseIndex];
  if (!phase) return [];

  const isolatedProgramme: LongitudinalOdinProgramme = {
    ...programme,
    programme: {
      ...programme.programme,
      target_weeks: phase.weeks_count,
    },
    phases: [
      {
        ...phase,
        phase_number: 1,
        start_week: 1,
        end_week: phase.weeks_count,
        weeks: phase.weeks.map((week, i) => ({
          ...week,
          week_number: i + 1,
        })),
      },
    ],
    fatigue_management_policy: {
      ...programme.fatigue_management_policy,
      planned_deload_weeks:
        programme.fatigue_management_policy.planned_deload_weeks
          .filter((w) => w >= phase.start_week && w <= phase.end_week)
          .map((w) => w - phase.start_week + 1),
    },
  };

  const perPhaseRules = longitudinalValidationRules.filter((rule) =>
    PER_PHASE_RULE_IDS.has(rule.id),
  );

  return perPhaseRules.flatMap((rule) =>
    rule.validate(isolatedProgramme, profile, exercises),
  );
};
