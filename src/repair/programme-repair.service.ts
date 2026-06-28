import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { DeterministicRepairOperation } from '../validation/validation.types.js';
import {
  MAX_PROGRAMME_REPAIR_OPERATIONS,
  repairEligibilityFor,
} from './repair-policy.js';
import type {
  ProgrammeRepairInput,
  ProgrammeRepairResult,
} from './repair.types.js';

const roleRank = {
  power: 0,
  primary: 1,
  secondary: 2,
  accessory: 3,
  isolation: 4,
  core: 5,
} as const;

export const repairProgramme = (
  input: ProgrammeRepairInput,
): ProgrammeRepairResult => {
  const errorFindings = input.validation.findings.filter(
    (finding) => finding.severity === 'error',
  );
  if (errorFindings.length === 0) {
    return {
      programme: input.programme,
      attempted: false,
      applied: false,
      operations: [],
    };
  }
  if (
    errorFindings.some(
      (finding) => repairEligibilityFor(finding.code) === 'non_repairable',
    )
  ) {
    return {
      programme: input.programme,
      attempted: false,
      applied: false,
      operations: [],
      rejection_reason: 'NON_REPAIRABLE_FINDING_PRESENT',
    };
  }

  const programme = structuredClone(input.programme) as LongitudinalOdinProgramme;
  const operations: DeterministicRepairOperation[] = [];
  const add = (
    operation: Omit<DeterministicRepairOperation, 'operation_id'>,
  ): boolean => {
    if (operations.length >= MAX_PROGRAMME_REPAIR_OPERATIONS) return false;
    operations.push({
      operation_id: `repair-${operations.length + 1}`,
      ...operation,
    });
    return true;
  };
  const codes = new Set(errorFindings.map((finding) => finding.code));

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) =>
      week.days.forEach((day) => {
        if (operations.length >= MAX_PROGRAMME_REPAIR_OPERATIONS) return;
        if (
          codes.has('DUPLICATE_EXERCISE_DISPLAY_ORDER') ||
          codes.has('PRIORITY_EXERCISE_PLACED_TOO_LATE') ||
          codes.has('POWER_EXERCISE_AFTER_FATIGUING_WORK') ||
          codes.has('GRIP_FATIGUE_SEQUENCE_CONFLICT') ||
          codes.has('LOWER_BACK_FATIGUE_SEQUENCE_CONFLICT') ||
          codes.has('CORE_FATIGUE_SEQUENCE_CONFLICT')
        ) {
          const ordered = [...day.exercises].sort(
            (left, right) =>
              roleRank[left.sequence_role] - roleRank[right.sequence_role] ||
              left.priority - right.priority ||
              left.exercise_id.localeCompare(right.exercise_id),
          );
          if (
            ordered.some(
              (exercise, index) =>
                exercise.exercise_id !== day.exercises[index]?.exercise_id ||
                exercise.display_order !== index + 1,
            )
          ) {
            day.exercises = ordered.map((exercise, index) => ({
              ...exercise,
              display_order: index + 1,
              sequencing_rationale: [
                ...new Set([
                  ...exercise.sequencing_rationale,
                  'DETERMINISTIC_SEQUENCE_REPAIR_APPLIED',
                ]),
              ],
            }));
            add({
              operation_type: 'reorder_exercise',
              target_id: day.day_id,
              reason_code: 'SEQUENCE_CONFLICT_REPAIRED',
              affected_finding_codes: errorFindings
                .map((finding) => finding.code)
                .filter(
                  (code) =>
                    code.includes('SEQUENCE') || code.includes('EXERCISE'),
                ),
            });
          }
        }
        day.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            if (
              codes.has('RPE_CEILING_BELOW_TARGET') &&
              set.rpe_ceiling < set.target_rpe &&
              add({
                operation_type: 'adjust_rpe_ceiling',
                target_id: exercise.prescription_id,
                reason_code: 'RPE_CEILING_NORMALIZED',
                affected_finding_codes: ['RPE_CEILING_BELOW_TARGET'],
              })
            ) {
              set.rpe_ceiling = set.target_rpe;
            }
          });
        });
        if (
          codes.has('CONDITIONING_BEFORE_PRIORITY_RESISTANCE') &&
          day.day_type === 'combined'
        ) {
          day.conditioning.forEach((item) => {
            if (
              item.placement === 'before_resistance' &&
              add({
                operation_type: 'move_conditioning_to_separate_day',
                target_id: item.conditioning_id,
                reason_code: 'RESISTANCE_PRIORITY_ORDER_RESTORED',
                affected_finding_codes: [
                  'CONDITIONING_BEFORE_PRIORITY_RESISTANCE',
                ],
              })
            ) {
              item.placement = 'after_resistance';
            }
          });
        }
        if (
          codes.has('COMBINED_SESSION_DURATION_EXCEEDED') &&
          day.estimated_duration_min !== null &&
          day.maximum_duration_min !== null
        ) {
          const excess = day.estimated_duration_min - day.maximum_duration_min;
          const item = day.conditioning[0];
          if (
            excess > 0 &&
            item &&
            item.duration_min - excess >= 10 &&
            add({
              operation_type: 'reduce_conditioning_duration',
              target_id: item.conditioning_id,
              reason_code: 'CONDITIONING_DURATION_REDUCED',
              affected_finding_codes: ['COMBINED_SESSION_DURATION_EXCEEDED'],
            })
          ) {
            item.duration_min -= excess;
            day.estimated_duration_min = day.maximum_duration_min;
            item.rationale = [
              ...new Set([...item.rationale, 'CONDITIONING_DURATION_REDUCED']),
            ];
          }
        }
      }),
    ),
  );

  if (operations.length >= MAX_PROGRAMME_REPAIR_OPERATIONS) {
    return {
      programme: input.programme,
      attempted: true,
      applied: false,
      operations,
      rejection_reason: 'REPAIR_OPERATION_LIMIT_EXCEEDED',
    };
  }
  return {
    programme,
    attempted: true,
    applied: operations.length > 0,
    operations,
    ...(operations.length === 0
      ? { rejection_reason: 'NO_APPROVED_REPAIR_APPLIED' }
      : {}),
  };
};
