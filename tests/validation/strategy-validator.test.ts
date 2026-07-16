import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { validateLongitudinalStrategy } from '../../src/validation/strategy-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

describe('V2 strategy validator', () => {
  it('accepts the valid fixture strategy', () => {
    const programme = clone();
    expect(
      validateLongitudinalStrategy(
        programme.strategy,
        programme.calendar,
        createProfile(),
      ),
    ).toEqual([]);
  });

  it.each([
    [
      'goal mismatch',
      'STRATEGY_GOAL_MISMATCH',
      (programme: ReturnType<typeof clone>) => {
        programme.strategy.primary_objective = 'strength';
      },
    ],
    [
      'calendar mismatch',
      'STRATEGY_CALENDAR_MISMATCH',
      (programme: ReturnType<typeof clone>) => {
        programme.strategy.resistance_frequency = 4;
      },
    ],
    [
      'training-status mismatch',
      'STRATEGY_TRAINING_STATUS_MISMATCH',
      (programme: ReturnType<typeof clone>) => {
        programme.strategy.progression_model = 'wave_loading';
      },
    ],
  ])('reports %s', (_name, expectedCode, mutate) => {
    const programme = clone();
    mutate(programme);
    const codes = validateLongitudinalStrategy(
      programme.strategy,
      programme.calendar,
      createProfile(),
    ).map(({ code }) => code);

    expect(codes).toContain(expectedCode);
  });

  it.each([
    [
      'returning training status',
      (profile: ReturnType<typeof createProfile>) => {
        profile.athlete_state.training_status.value = 'returning';
      },
    ],
    [
      'low recovery capacity',
      (profile: ReturnType<typeof createProfile>) => {
        profile.recovery_capacity = 'low';
      },
    ],
    [
      'an avoid-severity movement restriction',
      (profile: ReturnType<typeof createProfile>) => {
        profile.movement_restrictions.push({
          tag: 'loaded_deep_knee_flexion',
          severity: 'avoid',
          source_area: 'knee',
          notes: 'Active flare-up.',
        });
      },
    ],
    [
      'a blocking health flag',
      (profile: ReturnType<typeof createProfile>) => {
        profile.health_flags.push({
          code: 'MEDICAL_CLEARANCE_REQUIRED',
          severity: 'blocking',
          message: 'Physician clearance required before training.',
        });
      },
    ],
  ])(
    'requires full_body/upper_lower split for %s regardless of days available',
    (_name, mutateProfile) => {
      const programme = clone();
      programme.strategy.split_type = 'push_pull_legs';
      const profile = createProfile();
      mutateProfile(profile);

      expect(
        validateLongitudinalStrategy(
          programme.strategy,
          programme.calendar,
          profile,
        ).map(({ code }) => code),
      ).toContain('STRATEGY_SPLIT_SAFETY_OVERRIDE_VIOLATED');
    },
  );

  it('does not require the safety-split override when full_body/upper_lower is already selected', () => {
    const programme = clone();
    programme.strategy.split_type = 'upper_lower';
    const profile = createProfile();
    profile.recovery_capacity = 'low';

    expect(
      validateLongitudinalStrategy(
        programme.strategy,
        programme.calendar,
        profile,
      ).map(({ code }) => code),
    ).not.toContain('STRATEGY_SPLIT_SAFETY_OVERRIDE_VIOLATED');
  });

  it('reports missing split rationale', () => {
    const programme = clone();
    programme.strategy.rationale = programme.strategy.rationale.filter(
      (decision) => decision.code !== 'SPLIT_TYPE_DECISION',
    );

    expect(
      validateLongitudinalStrategy(
        programme.strategy,
        programme.calendar,
        createProfile(),
      ).map(({ code }) => code),
    ).toContain('SPLIT_RATIONALE_MISSING');
  });

  it('flags the AI strategy rationale describing a different split than the one it committed to', () => {
    // The exact production bug: split_type correctly reflects the split
    // actually built, but the model's own SPLIT_TYPE_DECISION rationale
    // entry describes a different split entirely.
    const programme = clone();
    const splitDecision = programme.strategy.rationale.find(
      (decision) => decision.code === 'SPLIT_TYPE_DECISION',
    )!;
    splitDecision.selected_value = 'push_pull_legs';

    expect(
      validateLongitudinalStrategy(
        programme.strategy,
        programme.calendar,
        createProfile(),
      ).map(({ code }) => code),
    ).toContain('AI_STRATEGY_RATIONALE_SPLIT_MISMATCH');
  });

  it('rejects competition peak without a target date', () => {
    const programme = clone();
    programme.strategy.periodization_model = 'competition_peak';

    expect(
      validateLongitudinalStrategy(
        programme.strategy,
        programme.calendar,
        createProfile(),
      ).map(({ code }) => code),
    ).toContain('COMPETITION_PHASE_DATE_MISMATCH');
  });
});
