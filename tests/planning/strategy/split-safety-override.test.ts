import { describe, expect, it } from 'vitest';
import { requiresSafeSplit } from '../../../src/planning/strategy/split-safety-override.js';
import { createProfile } from '../test-planning-utils.js';

describe('requiresSafeSplit', () => {
  it('is false for an otherwise-unremarkable profile', () => {
    expect(requiresSafeSplit(createProfile())).toBe(false);
  });

  it('is true for returning training status', () => {
    const profile = createProfile();
    profile.athlete_state.training_status.value = 'returning';
    expect(requiresSafeSplit(profile)).toBe(true);
  });

  it('is true for low recovery capacity', () => {
    const profile = createProfile();
    profile.recovery_capacity = 'low';
    expect(requiresSafeSplit(profile)).toBe(true);
  });

  it('is true for an avoid-severity movement restriction', () => {
    const profile = createProfile();
    profile.movement_restrictions.push({
      tag: 'loaded_deep_knee_flexion',
      severity: 'avoid',
      source_area: 'knee',
      notes: 'Active flare-up.',
    });
    expect(requiresSafeSplit(profile)).toBe(true);
  });

  it('is true for a blocking health flag', () => {
    const profile = createProfile();
    profile.health_flags.push({
      code: 'MEDICAL_CLEARANCE_REQUIRED',
      severity: 'blocking',
      message: 'Physician clearance required before training.',
    });
    expect(requiresSafeSplit(profile)).toBe(true);
  });

  it('is false for a modify-severity (not avoid) movement restriction', () => {
    const profile = createProfile();
    profile.movement_restrictions.push({
      tag: 'loaded_deep_knee_flexion',
      severity: 'modify',
      source_area: 'knee',
      notes: 'Use a supported range.',
    });
    expect(requiresSafeSplit(profile)).toBe(false);
  });
});
