import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { estimateWarmupItemSeconds } from '../planning/warmup/warmup.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateLongitudinalWarmups = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const clinicianPreparationRequired = profile.movement_restrictions.some(
    (restriction) => restriction.clinician_restriction,
  );

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) =>
      week.days
        .filter((day) => day.day_type === 'resistance')
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
          const warmupSeconds = day.warmup.reduce(
            (sum, item) => sum + estimateWarmupItemSeconds(item),
            0,
          );
          const primary = [...day.exercises].sort(
            (left, right) => left.priority - right.priority,
          )[0];
          const ramps = day.warmup.filter(
            (item) =>
              item.component_type === 'ramp_up_set' &&
              item.related_exercise_id === primary?.exercise_id,
          );

          if (
            day.warmup.length === 0 ||
            !day.warmup.some((item) =>
              ['movement_rehearsal', 'dynamic_mobility'].includes(
                item.component_type,
              ),
            )
          ) {
            add(
              'WARMUP_NOT_SESSION_SPECIFIC',
              'error',
              'Resistance warm-up does not prepare a selected movement pattern.',
            );
          }
          if (warmupSeconds > 900) {
            add(
              'WARMUP_DURATION_EXCESSIVE',
              'error',
              'Warm-up exceeds the deterministic 15-minute upper planning band.',
            );
          }
          if (
            day.warmup.some(
              (item) =>
                item.duration_seconds === undefined &&
                item.repetitions === undefined,
            )
          ) {
            add(
              'WARMUP_COMPONENT_INVALID',
              'error',
              'Warm-up component lacks an exact duration or repetition target.',
            );
          }
          if (primary && ramps.length === 0) {
            add(
              'RAMP_UP_SETS_MISSING',
              'error',
              'First priority exercise lacks an exercise-specific ramp-up set.',
            );
          }
          if (ramps.length > 4) {
            add(
              'RAMP_UP_SET_EXCESSIVE',
              'error',
              'Ramp-up volume exceeds the bounded policy.',
            );
          }
          const hasPower = day.exercises.some(
            (exercise) => exercise.sequence_role === 'power',
          );
          if (
            hasPower &&
            day.warmup.some(
              (item) =>
                item.activity_name.toLowerCase().includes('stretch') &&
                (item.duration_seconds ?? 0) > 30,
            )
          ) {
            add(
              'STATIC_STRETCH_CONFLICT',
              'error',
              'Prolonged static stretching appears immediately before power work.',
            );
          }
          if (
            clinicianPreparationRequired &&
            !day.warmup.some((item) =>
              item.rationale_codes.includes(
                'CLINICIAN_MOBILITY_REQUIREMENT_APPLIED',
              ),
            )
          ) {
            add(
              'CLINICIAN_PREPARATION_OMITTED',
              'error',
              'Clinician-directed preparation is missing from the resistance warm-up.',
            );
          }
          if (
            day.maximum_duration_min !== null &&
            day.estimated_duration_min !== null &&
            day.estimated_duration_min > day.maximum_duration_min
          ) {
            add(
              'SESSION_DURATION_EXCEEDED_AFTER_WARMUP',
              'error',
              'Session exceeds its maximum duration after warm-up planning.',
            );
          }
        }),
    ),
  );

  return findings;
};
