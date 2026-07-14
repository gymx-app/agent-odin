import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { LongitudinalOdinProgrammeSchema } from '../../src/domain/programme/programme.schema.js';
import { buildLongitudinalProgramme } from '../../src/planning/longitudinal-programme-planner.js';
import { createProfile } from './test-planning-utils.js';

describe('end-to-end longitudinal programme planner', () => {
  it('builds and independently validates a complete deterministic programme', { timeout: 15_000 }, () => {
    const profile = createProfile({
      available_days_per_week: 4,
      session_duration_min: 60,
    });
    const first = buildLongitudinalProgramme(profile, seedExercises, {
      startDate: '2026-06-22',
      generatedAt: '2026-06-19T05:30:00.000Z',
      exerciseLibraryVersion: 'test-v1',
    });
    const second = buildLongitudinalProgramme(profile, seedExercises, {
      startDate: '2026-06-22',
      generatedAt: '2026-06-19T05:30:00.000Z',
      exerciseLibraryVersion: 'test-v1',
    });

    expect(first).toEqual(second);
    expect(first.validation.passed).toBe(true);
    expect(first.validation.repair?.attempted).toBe(false);
    expect(
      LongitudinalOdinProgrammeSchema.safeParse(first.programme).success,
    ).toBe(true);
    expect(first.programme.validation_summary.status).toMatch(/^valid/);
    first.programme.phases
      .flatMap((phase) => phase.weeks)
      .flatMap((week) => week.days)
      .filter((day) => day.day_type === 'resistance')
      .forEach((day) => {
        expect(day.warmup.length).toBeGreaterThan(0);
        expect(day.exercises.length).toBeGreaterThan(0);
        expect(day.estimated_duration_min).toBeLessThanOrEqual(
          day.maximum_duration_min!,
        );
      });
  });

  it('executes the longitudinal stage boundaries in deterministic order', () => {
    const stages: string[] = [];
    buildLongitudinalProgramme(createProfile(), seedExercises, {
      startDate: '2026-06-22',
      generatedAt: '2026-06-19T05:30:00.000Z',
      stageRunner: (stage, operation) => {
        stages.push(stage);
        return operation();
      },
    });

    expect(stages).toEqual([
      'strategy',
      'calendar',
      'strategy_selection',
      'phases',
      'weeks',
      'sessions',
      'warmup_and_sequence',
      'conditioning',
      'weight_prescription',
      'composition',
      'validation',
      'repair',
      'final_validation',
    ]);
  });

  it.each([
    ['returning', { fitness_level: 'beginner' }],
    [
      'knee restricted',
      {
        movement_restrictions: [
          {
            region: 'knee',
            movement_demand: 'loaded_deep_knee_flexion',
            tolerance: 'excluded',
          },
        ],
      },
    ],
    [
      'intermediate hypertrophy',
      { goal: 'muscle_gain', fitness_level: 'intermediate' },
    ],
    [
      'advanced strength',
      {
        goal: 'strength',
        fitness_level: 'advanced',
        training_history: {
          years_consistent_training: 8,
          consistency_last_12_weeks: 'high',
          exercise_competency: 'advanced',
        },
      },
    ],
    ['short session', { session_duration_min: 30 }],
  ] as const)('validates the %s regression profile', (_name, patch) => {
    const result = buildLongitudinalProgramme(
      createProfile({
        available_days_per_week: 4,
        ...patch,
      }),
      seedExercises,
      {
        startDate: '2026-06-22',
        generatedAt: '2026-06-19T05:30:00.000Z',
      },
    );
    expect(result.validation.passed).toBe(true);
    expect(
      result.validation.findings.some((item) => item.severity === 'error'),
    ).toBe(false);
  });

  it('uses a 5th resistance day when 4 days cannot fit minimum effective volume', () => {
    const result = buildLongitudinalProgramme(
      createProfile({
        available_days_per_week: 5,
        session_duration_min: 30,
        fitness_level: 'advanced',
        goal: 'muscle_gain',
      }),
      seedExercises,
      {
        startDate: '2026-06-22',
        generatedAt: '2026-06-19T05:30:00.000Z',
      },
    );

    expect(result.programme.strategy.resistance_frequency).toBe(5);
    expect(result.validation.passed).toBe(true);
  });

  it('populates weight_kg for prescribed compound lifts when the athlete self-reports known lifts', () => {
    const result = buildLongitudinalProgramme(
      createProfile({
        available_days_per_week: 4,
        fitness_level: 'advanced',
        goal: 'strength',
        baseline_path: 'self_reported',
        known_lifts: [
          { exercise_id: 'squat', weight_kg: 140, reps: 5 },
          { exercise_id: 'bench_press', weight_kg: 100, reps: 5 },
          { exercise_id: 'deadlift', weight_kg: 180, reps: 3 },
          { exercise_id: 'overhead_press', weight_kg: 60, reps: 5 },
          { exercise_id: 'barbell_row', weight_kg: 90, reps: 5 },
        ],
      }),
      seedExercises,
      {
        startDate: '2026-06-22',
        generatedAt: '2026-06-19T05:30:00.000Z',
      },
    );

    expect(result.validation.passed).toBe(true);
    const allExercises = result.programme.phases
      .flatMap((phase) => phase.weeks)
      .flatMap((week) => week.days)
      .flatMap((day) => day.exercises);
    const knownLiftIds = new Set([
      'barbell_back_squat',
      'barbell_bench_press',
      'barbell_deadlift',
      'trap_bar_deadlift',
      'barbell_overhead_press',
      'barbell_bent_over_row',
      'barbell_pendlay_row',
      'tbar_row',
    ]);
    const pricedCompoundLifts = allExercises.filter(
      (exercise) =>
        knownLiftIds.has(exercise.exercise_id) && exercise.weight_kg !== null,
    );
    expect(pricedCompoundLifts.length).toBeGreaterThan(0);
    // Every priced exercise should be plate-loadable.
    pricedCompoundLifts.forEach((exercise) => {
      expect(exercise.weight_kg! % 2.5).toBe(0);
    });
  });
});
