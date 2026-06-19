import type { ValidationCode } from '../validation/validation-codes.js';
import type { RepairEligibility } from './repair.types.js';

export const MAX_PROGRAMME_REPAIR_OPERATIONS = 10;

const repairable = new Set<ValidationCode>([
  'DUPLICATE_EXERCISE_DISPLAY_ORDER',
  'PRIORITY_EXERCISE_PLACED_TOO_LATE',
  'POWER_EXERCISE_AFTER_FATIGUING_WORK',
  'GRIP_FATIGUE_SEQUENCE_CONFLICT',
  'LOWER_BACK_FATIGUE_SEQUENCE_CONFLICT',
  'CORE_FATIGUE_SEQUENCE_CONFLICT',
  'CONDITIONING_BEFORE_PRIORITY_RESISTANCE',
  'COMBINED_SESSION_DURATION_EXCEEDED',
  'SESSION_DURATION_EXCEEDED_AFTER_WARMUP',
  'RPE_CEILING_BELOW_TARGET',
]);

const conditional = new Set<ValidationCode>([
  'SESSION_ON_UNAVAILABLE_DAY',
  'EXCLUDED_EXERCISE_SELECTED',
  'SPORT_CONDITIONING_DUPLICATION',
]);

export const repairEligibilityFor = (
  code: ValidationCode,
): RepairEligibility =>
  repairable.has(code)
    ? 'repairable'
    : conditional.has(code)
      ? 'conditionally_repairable'
      : 'non_repairable';
