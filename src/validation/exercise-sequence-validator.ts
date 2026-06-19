import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateLongitudinalExerciseSequences = (
  programme: LongitudinalOdinProgramme,
  exercises: Exercise[],
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const metadata = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) =>
      week.days
        .filter((day) => day.day_type === 'resistance')
        .forEach((day) => {
          const add = (
            code: keyof typeof validationCodes,
            message: string,
            exerciseId?: string,
          ) =>
            findings.push(
              finding(
                validationCodes[code],
                'error',
                code.includes('DURATION')
                  ? 'session_time_fit'
                  : 'fatigue_management',
                message,
                {
                  ...(exerciseId ? { exercise_id: exerciseId } : {}),
                  metadata: {
                    week_number: week.week_number,
                    cycle_day: day.cycle_day,
                  },
                },
              ),
            );
          const ordered = [...day.exercises].sort(
            (left, right) => left.display_order - right.display_order,
          );
          const orders = ordered.map((exercise) => exercise.display_order);
          if (
            new Set(orders).size !== orders.length ||
            orders.some((order, index) => order !== index + 1)
          ) {
            add(
              'DUPLICATE_EXERCISE_DISPLAY_ORDER',
              'Exercise display order must be unique and consecutive.',
            );
          }
          ordered.forEach((exercise, index) => {
            const prior = ordered.slice(0, index);
            const priorMetadata = prior
              .map((item) => metadata.get(item.exercise_id))
              .filter((item): item is Exercise => item !== undefined);
            if (exercise.sequencing_rationale.length === 0) {
              add(
                'SEQUENCE_RATIONALE_MISSING',
                'Exercise position lacks sequencing rationale.',
                exercise.exercise_id,
              );
            }
            if (
              exercise.sequence_role === 'power' &&
              priorMetadata.some((item) => item.fatigue_cost.systemic >= 3)
            ) {
              add(
                'POWER_EXERCISE_AFTER_FATIGUING_WORK',
                'Power work follows meaningful systemic fatigue.',
                exercise.exercise_id,
              );
            }
            if (
              exercise.sequence_role === 'primary' &&
              exercise.movement_patterns.some((pattern) =>
                ['horizontal_pull', 'vertical_pull'].includes(pattern),
              ) &&
              priorMetadata.some((item) => item.fatigue_cost.grip >= 4)
            ) {
              add(
                'GRIP_FATIGUE_SEQUENCE_CONFLICT',
                'High grip fatigue precedes a priority pull.',
                exercise.exercise_id,
              );
            }
            if (
              exercise.sequence_role === 'primary' &&
              exercise.movement_patterns.some((pattern) =>
                ['hinge', 'horizontal_pull'].includes(pattern),
              ) &&
              priorMetadata.some((item) => item.fatigue_cost.axial >= 4)
            ) {
              add(
                'LOWER_BACK_FATIGUE_SEQUENCE_CONFLICT',
                'High lower-back fatigue precedes a priority hinge or row.',
                exercise.exercise_id,
              );
            }
            if (
              exercise.movement_patterns.some((pattern) =>
                ['squat', 'hinge', 'horizontal_pull', 'vertical_push'].includes(
                  pattern,
                ),
              ) &&
              prior.some((item) => {
                const approved = metadata.get(item.exercise_id);
                return (
                  item.sequence_role === 'core' &&
                  Math.max(
                    approved?.fatigue_cost.local ?? 0,
                    approved?.fatigue_cost.systemic ?? 0,
                  ) >= 4
                );
              })
            ) {
              add(
                'CORE_FATIGUE_SEQUENCE_CONFLICT',
                'Fatiguing core work precedes a high-stability movement.',
                exercise.exercise_id,
              );
            }
          });
          const primaryIndex = ordered.findIndex(
            (exercise) => exercise.sequence_role === 'primary',
          );
          const precedingPrimary = ordered.slice(0, primaryIndex);
          if (
            primaryIndex > 1 ||
            precedingPrimary.some((exercise) =>
              ['accessory', 'core'].includes(exercise.sequence_role),
            )
          ) {
            add(
              'PRIORITY_EXERCISE_PLACED_TOO_LATE',
              'Primary exercise is placed after conflicting non-priority work.',
              ordered[primaryIndex]?.exercise_id,
            );
          }
          const isolationBeforePrimary = precedingPrimary.some(
            (exercise) => exercise.sequence_role === 'isolation',
          );
          const specializationException =
            day.session_metadata?.sequence_exceptions?.some(
              (exception) =>
                exception.code === 'PRIORITY_ISOLATION_ADVANCED' ||
                exception.code === 'PRE_EXHAUST_STRATEGY_APPLIED',
            );
          if (isolationBeforePrimary && !specializationException) {
            add(
              'UNJUSTIFIED_PRE_EXHAUST',
              'Isolation work precedes primary work without an explicit supported strategy.',
            );
          }
          if (
            day.maximum_duration_min !== null &&
            day.estimated_duration_min !== null &&
            day.estimated_duration_min > day.maximum_duration_min
          ) {
            add(
              'SESSION_DURATION_EXCEEDED_AFTER_SEQUENCING',
              'Session exceeds its maximum duration after sequencing.',
            );
          }
        }),
    ),
  );

  return findings;
};
