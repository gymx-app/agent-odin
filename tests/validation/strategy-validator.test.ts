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
