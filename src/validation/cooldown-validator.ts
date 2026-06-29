import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

const COOLDOWN_MINIMUM = 3;

export const validateLongitudinalCooldowns = (
  programme: LongitudinalOdinProgramme,
  _profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const exerciseIdSet = new Set(exercises.map((e) => e.id));

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) =>
      week.days
        .filter(
          (day) =>
            day.day_type === 'resistance' || day.day_type === 'combined',
        )
        .forEach((day) => {
          const metadata = {
            week_number: week.week_number,
            cycle_day: day.cycle_day,
          };
          const add = (
            code: keyof typeof validationCodes,
            severity: 'warning' | 'error',
            message: string,
          ) =>
            findings.push(
              finding(
                validationCodes[code],
                severity,
                'prescription_quality',
                message,
                { metadata },
              ),
            );

          if (!day.cooldown || day.cooldown.length < COOLDOWN_MINIMUM) {
            add(
              'COOLDOWN_EMPTY',
              'error',
              `Resistance day cooldown has ${day.cooldown?.length ?? 0} stretches; minimum is ${COOLDOWN_MINIMUM}.`,
            );
            return;
          }

          day.cooldown.forEach((item) => {
            const missingId =
              !item.exercise_id || !exerciseIdSet.has(item.exercise_id);
            const missingDuration =
              !item.duration_seconds || item.duration_seconds <= 0;
            const missingPurpose =
              !item.purpose || item.purpose.trim().length === 0;

            if (missingId || missingDuration || missingPurpose) {
              add(
                'COOLDOWN_INVALID_EXERCISE',
                'error',
                `Cooldown item "${item.exercise_id ?? '(no id)'}" is invalid: ${[
                  missingId ? 'exercise_id not in library' : null,
                  missingDuration ? 'duration_seconds missing' : null,
                  missingPurpose ? 'purpose empty' : null,
                ]
                  .filter(Boolean)
                  .join(', ')}.`,
              );
            }
          });
        }),
    ),
  );

  return findings;
};
