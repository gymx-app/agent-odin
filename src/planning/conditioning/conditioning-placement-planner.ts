import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { ConditioningPrescription } from './conditioning.types.js';

// odin-programme-design-logic.md, Section 2: placing conditioning after
// resistance work cites MURLASITS_2018_CONCURRENT for the real,
// programme-level finding (resistance-before-endurance ordering preserves
// strength gains over weeks) — but that study doesn't test the acute,
// single-session mechanism ("pre-fatiguing degrades that day's stimulus")
// this ordering choice is actually justified by day-to-day. That acute
// reasoning is standard practice, not itself an RCT finding — flagged
// explicitly rather than borrowing Murlasits's confidence for it.
const AFTER_RESISTANCE_RATIONALE = [
  'MURLASITS_2018_CONCURRENT',
  'CONDITIONING_AFTER_RESISTANCE_ACUTE_ORDERING_HEURISTIC',
];

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
  rationale_codes: string[];
} => {
  if (input.dayType !== 'combined') {
    return {
      placement: 'standalone',
      rationale_codes: ['SEPARATE_DAY_CONDITIONING_SELECTED'],
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
      rationale_codes: ['CONDITIONING_MOVED_TO_SEPARATE_DAY'],
    };
  }
  if (
    input.priority === 'conditioning' ||
    (input.priority === 'equal' && input.weekNumber % 2 === 1)
  ) {
    return {
      placement: 'before_resistance',
      rationale_codes: [
        input.priority === 'equal'
          ? 'EQUAL_PRIORITY_ALTERNATION_APPLIED'
          : 'CONDITIONING_PRIORITY_ORDER_APPLIED',
      ],
    };
  }
  return {
    placement: 'after_resistance',
    rationale_codes: [
      input.priority === 'equal'
        ? 'EQUAL_PRIORITY_ALTERNATION_APPLIED'
        : 'RESISTANCE_PRIORITY_ORDER_APPLIED',
      ...AFTER_RESISTANCE_RATIONALE,
    ],
  };
};
