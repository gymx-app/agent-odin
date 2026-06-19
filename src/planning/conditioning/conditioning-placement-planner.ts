import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { ConditioningPrescription } from './conditioning.types.js';

export const planConditioningPlacement = (input: {
  profile: NormalizedAthleteProfile;
  dayType: string;
  priority: 'resistance' | 'conditioning' | 'equal';
  weekNumber: number;
  availableCombinedMinutes: number;
}): {
  placement: ConditioningPrescription['placement'];
  same_day_separation?: NonNullable<
    ConditioningPrescription['same_day_separation']
  >;
  rationale_code: string;
} => {
  if (input.dayType !== 'combined') {
    return {
      placement: 'standalone',
      rationale_code: 'SEPARATE_DAY_CONDITIONING_SELECTED',
    };
  }
  if (input.availableCombinedMinutes < 10) {
    return {
      placement: 'same_day_separate_session',
      same_day_separation: {
        category:
          input.profile.recovery_capacity === 'low'
            ? 'over_12_hours'
            : '6_to_12_hours',
      },
      rationale_code: 'CONDITIONING_MOVED_TO_SEPARATE_DAY',
    };
  }
  if (
    input.priority === 'conditioning' ||
    (input.priority === 'equal' && input.weekNumber % 2 === 1)
  ) {
    return {
      placement: 'before_resistance',
      rationale_code:
        input.priority === 'equal'
          ? 'EQUAL_PRIORITY_ALTERNATION_APPLIED'
          : 'CONDITIONING_PRIORITY_ORDER_APPLIED',
    };
  }
  return {
    placement: 'after_resistance',
    rationale_code:
      input.priority === 'equal'
        ? 'EQUAL_PRIORITY_ALTERNATION_APPLIED'
        : 'RESISTANCE_PRIORITY_ORDER_APPLIED',
  };
};
