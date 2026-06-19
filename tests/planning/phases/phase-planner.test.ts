import { describe, expect, it } from 'vitest';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { planTrainingCalendar } from '../../../src/planning/calendar/calendar-planner.js';
import { planProgrammePhases } from '../../../src/planning/phases/phase-planner.js';
import { selectProgrammeStrategyV2 } from '../../../src/planning/strategy/strategy-selector.js';
import { createAthlete } from '../../normalization/test-athletes.js';

const plan = (
  athletePatch: Partial<AthleteInput>,
  horizon: number,
  resistance: number,
) => {
  const normalized = normalizeAthlete(
    createAthlete({
      available_days_per_week: resistance,
      ...athletePatch,
    }),
  );
  const profile = { ...normalized, programme_horizon_weeks: horizon };
  const split =
    resistance <= 3
      ? 'full_body'
      : resistance === 4
        ? 'upper_lower'
        : resistance === 6
          ? 'push_pull_legs'
          : 'hybrid';
  const calendar = planTrainingCalendar({
    profile,
    strategy: {
      split_type: split,
      resistance_frequency: resistance,
      conditioning_frequency: 0,
      cycle_length_days: 7,
    },
    cycleAnchorDate: '2026-06-22',
  }).calendar;
  const strategy = selectProgrammeStrategyV2({ profile, calendar }).strategy;
  return planProgrammePhases({ profile, strategy, calendar });
};

describe('Phase Planner V2', () => {
  it('creates Foundation, Progression and Consolidation for a medium beginner', () => {
    const result = plan({ fitness_level: 'beginner' }, 10, 3);
    expect(result.phases.map(({ name }) => name)).toEqual([
      'Foundation',
      'Progression',
      'Consolidation',
    ]);
    expect(result.planned_deload_weeks).toEqual([]);
  });

  it('creates Foundation, Hypertrophy and Recovery for intermediate hypertrophy', () => {
    const result = plan(
      { fitness_level: 'intermediate', goal: 'muscle_gain' },
      12,
      4,
    );
    expect(result.phases.map(({ name }) => name)).toEqual([
      'Foundation',
      'Hypertrophy',
      'Recovery',
    ]);
    expect(result.phases).not.toContainEqual(
      expect.objectContaining({ name: 'Testing' }),
    );
  });

  it('creates strength architecture and a final performance phase for competition', () => {
    const result = plan(
      {
        fitness_level: 'advanced',
        goal: 'strength',
        sport: {
          name: 'Powerlifting',
          sessions_per_week: 1,
          session_days: ['SUN'],
          intensity: 'high',
          priority: 'equal',
          competition_date: '2026-10-18',
        },
      },
      16,
      4,
    );
    expect(result.phases.map(({ name }) => name)).toContain('Strength');
    expect(result.phases.at(-1)?.name).toBe('Performance');
  });

  it('uses a Fat Loss phase without realization', () => {
    const result = plan(
      {
        fitness_level: 'intermediate',
        goal: 'fat_loss',
        nutrition: { calorie_status: 'deficit' },
      },
      12,
      4,
    );
    expect(result.phases.map(({ name }) => name)).toContain('Fat Loss');
    expect(
      result.phases.some(({ phase_type }) => phase_type === 'realization'),
    ).toBe(false);
  });

  it('allocates every programme week exactly once without gaps', () => {
    const result = plan(
      { fitness_level: 'advanced', goal: 'muscle_gain' },
      20,
      5,
    );
    expect(
      result.phases.reduce((sum, phase) => sum + phase.weeks_count, 0),
    ).toBe(20);
    expect(result.phases[0]?.start_week).toBe(1);
    expect(result.phases.at(-1)?.end_week).toBe(20);
    result.phases.slice(1).forEach((phase, index) => {
      expect(phase.start_week).toBe(result.phases[index]!.end_week + 1);
    });
  });

  it('aligns planned deloads to recovery transitions', () => {
    const result = plan(
      { fitness_level: 'advanced', goal: 'muscle_gain' },
      20,
      5,
    );
    const recoveryStarts = result.phases
      .filter(({ phase_type }) => phase_type === 'recovery')
      .map(({ start_week }) => start_week);
    expect(result.planned_deload_weeks).toEqual(recoveryStarts);
    expect(result.rationale_codes).toContain(
      'DELOAD_ALIGNED_TO_PHASE_TRANSITION',
    );
  });

  it('uses fewer phases for a short programme', () => {
    const result = plan({ fitness_level: 'beginner' }, 5, 3);
    expect(result.phases).toHaveLength(2);
    expect(result.planned_deload_weeks).toEqual([]);
  });

  it('is deterministic across strategy, boundaries, deloads and rationale', () => {
    const results = Array.from({ length: 10 }, () =>
      plan({ fitness_level: 'intermediate', goal: 'muscle_gain' }, 12, 4),
    );
    results.slice(1).forEach((result) => {
      expect(result).toStrictEqual(results[0]);
    });
  });
});
