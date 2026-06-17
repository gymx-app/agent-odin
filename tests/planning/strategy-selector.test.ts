import { describe, expect, it } from 'vitest';
import { selectProgrammeStrategy } from '../../src/planning/strategy-selector.js';
import { createProfile } from './test-planning-utils.js';

describe('selectProgrammeStrategy', () => {
  it('selects 2-day beginner full body', () => {
    expect(
      selectProgrammeStrategy(
        createProfile({
          available_days_per_week: 2,
          fitness_level: 'beginner',
        }),
      ),
    ).toMatchObject({
      split_type: 'full_body',
      resistance_days: 2,
    });
  });

  it('selects 3-day full body', () => {
    expect(
      selectProgrammeStrategy(createProfile({ available_days_per_week: 3 }))
        .split_type,
    ).toBe('full_body');
  });

  it('selects 4-day upper lower', () => {
    expect(
      selectProgrammeStrategy(createProfile({ available_days_per_week: 4 }))
        .split_type,
    ).toBe('upper_lower');
  });

  it('selects 5-day fat-loss schedule with LISS', () => {
    expect(
      selectProgrammeStrategy(
        createProfile({ available_days_per_week: 5, goal: 'fat_loss' }),
      ),
    ).toMatchObject({
      resistance_days: 4,
      liss_days: 1,
    });
  });

  it('selects 5-day muscle-gain hybrid', () => {
    expect(
      selectProgrammeStrategy(
        createProfile({ available_days_per_week: 5, goal: 'muscle_gain' }),
      ),
    ).toMatchObject({
      split_type: 'hybrid',
      resistance_days: 5,
    });
  });

  it('allows 6-day intermediate PPL', () => {
    expect(
      selectProgrammeStrategy(
        createProfile({
          available_days_per_week: 6,
          fitness_level: 'intermediate',
        }),
      ).split_type,
    ).toBe('push_pull_legs');
  });

  it('uses 6-day low-recovery fallback', () => {
    const profile = {
      ...createProfile({
        available_days_per_week: 6,
        fitness_level: 'intermediate',
      }),
      recovery_capacity: 'low' as const,
    };

    expect(selectProgrammeStrategy(profile).split_type).toBe('hybrid');
  });

  it('does not create 7 resistance days', () => {
    expect(
      selectProgrammeStrategy(createProfile({ available_days_per_week: 7 }))
        .resistance_days,
    ).toBeLessThan(7);
  });
});
