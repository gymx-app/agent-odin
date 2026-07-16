import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';

// odin-programme-design-logic.md, Section 1: return-to-training status, low
// recovery capacity, an avoid-severity movement restriction, or a blocking
// health flag requires full_body/upper_lower regardless of days available —
// a conservative safety default, not evidence from a specific trial.
//
// Extracted to a single shared function after this condition was duplicated
// (with a "keep in sync" comment) across strategy-selector.ts and
// strategy-validator.ts, and was about to be needed a third time in
// rationale-summary.ts to reconcile an AI-generated strategy's own rationale
// text against the split it actually committed to.
export const requiresSafeSplit = (profile: NormalizedAthleteProfile): boolean =>
  profile.athlete_state.training_status.value === 'returning' ||
  profile.recovery_capacity === 'low' ||
  profile.movement_restrictions.some(
    (restriction) => restriction.severity === 'avoid',
  ) ||
  profile.health_flags.some((flag) => flag.severity === 'blocking');

export const SAFE_SPLIT_TYPES = ['full_body', 'upper_lower'] as const;
