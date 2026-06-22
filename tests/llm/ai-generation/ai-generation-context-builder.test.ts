import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../../fixtures/exercises/seed-exercises.js';
import { createProfile } from '../../planning/test-planning-utils.js';
import {
  buildAiStrategyContext,
  buildAiPhaseContext,
  summarisePhase,
} from '../../../src/llm/ai-generation/ai-generation-context-builder.js';
import type { AiStrategyOutput } from '../../../src/llm/ai-generation/ai-generation.types.js';

const profile = createProfile({
  available_days_per_week: 4,
  session_duration_min: 60,
});

describe('buildAiStrategyContext', () => {
  it('includes athlete, evidence rules, exercise library summary, and constraints', () => {
    const ctx = buildAiStrategyContext(profile, seedExercises);

    expect(ctx.athlete).toBeDefined();
    expect((ctx.athlete as Record<string, unknown>).goal).toBe('fat_loss');
    expect((ctx.athlete as Record<string, unknown>).available_days_per_week).toBe(4);

    expect(ctx.evidence_rules).toBeDefined();
    expect((ctx.evidence_rules as Record<string, unknown>).volume_fill_rates).toBeDefined();
    expect((ctx.evidence_rules as Record<string, unknown>).hiit_cycling).toBeDefined();

    expect(ctx.exercise_library_summary).toBeDefined();
    expect(
      (ctx.exercise_library_summary as Record<string, unknown>).total_exercises,
    ).toBe(seedExercises.length);

    expect(ctx.constraints).toBeDefined();
    expect((ctx.constraints as Record<string, unknown>).max_session_duration_min).toBe(60);
  });

  it('groups exercises by movement pattern in the summary', () => {
    const ctx = buildAiStrategyContext(profile, seedExercises);
    const summary = ctx.exercise_library_summary as {
      by_movement_pattern: Record<string, { count: number }>;
    };
    expect(Object.keys(summary.by_movement_pattern).length).toBeGreaterThan(0);
  });
});

describe('buildAiPhaseContext', () => {
  const mockStrategy: AiStrategyOutput = {
    programme: {
      name: 'Test Programme',
      goal_type: 'fat_loss',
      goal_description: 'Lose body fat',
      target_weeks: 8,
    },
    athlete_summary: {
      training_status: 'beginner',
      recovery_capacity: 'moderate',
      energy_availability: 'deficit',
      movement_limitation_level: 'none',
      sport_interference_risk: 'none',
      programme_confidence: 'moderate',
    },
    strategy: {
      primary_objective: 'fat_loss',
      periodization_model: 'simple_progressive',
      progression_model: 'double_progression',
      split_type: 'full_body',
      resistance_frequency: 3,
      conditioning_frequency: 1,
      cycle_length_days: 7,
      volume_strategy: 'conservative',
      intensity_strategy: 'technique_first',
      fatigue_strategy: 'planned_deload',
      conditioning_strategy: 'fat_loss_support',
      rationale: [],
    },
    calendar: {
      cycle_type: 'weekly',
      cycle_length_days: 7,
      anchor_date: '2026-06-22',
      repeats: true,
      days: [
        { cycle_day: 1, day_of_week: 'MON', planned_session_type: 'resistance', session_label: 'Full Body A' },
        { cycle_day: 2, day_of_week: 'TUE', planned_session_type: 'rest', session_label: 'Rest' },
        { cycle_day: 3, day_of_week: 'WED', planned_session_type: 'resistance', session_label: 'Full Body B' },
        { cycle_day: 4, day_of_week: 'THU', planned_session_type: 'rest', session_label: 'Rest' },
        { cycle_day: 5, day_of_week: 'FRI', planned_session_type: 'resistance', session_label: 'Full Body C' },
        { cycle_day: 6, day_of_week: 'SAT', planned_session_type: 'conditioning', session_label: 'Conditioning' },
        { cycle_day: 7, day_of_week: 'SUN', planned_session_type: 'rest', session_label: 'Rest' },
      ],
    },
    phase_skeletons: [
      {
        phase_id: 'phase-1',
        phase_number: 1,
        name: 'Foundation',
        phase_type: 'foundation',
        objective: 'Build base',
        start_week: 1,
        end_week: 4,
        weeks_count: 4,
        volume_direction: 'increase',
        intensity_direction: 'maintain',
        effort_direction: 'increase',
        progression_model: 'double_progression',
      },
    ],
    progression_policy: {
      policy_id: 'prog-policy-1',
      default_model: 'double_progression',
      success_condition: 'All sets completed at target reps within RPE ceiling',
      hold_condition: 'RPE exceeds ceiling on 2+ sets',
      regression_condition: 'Missed reps on 2 consecutive sessions',
      exercise_overrides: [],
      rationale: ['ACSM_2021_GUIDELINES'],
    },
    fatigue_management_policy: {
      strategy: 'planned_deload',
      planned_deload_weeks: [4],
      deload_adjustments: { volume_factor: 0.6 },
      readiness_triggers: [],
      rationale: ['ACSM_2021_GUIDELINES'],
    },
    substitution_policy: {
      allowed: true,
      preserve: 'movement_pattern',
      require_same_eligibility_status: true,
      rules: [],
    },
    conditioning_policy: {
      policy_id: 'cond-policy-1',
      weekly_target_sessions: 1,
      primary_purpose: 'fat_loss_support',
      preferred_modalities: ['stationary_bike'],
      restricted_modalities: [],
      progression_model: 'duration_first',
      concurrent_training_priority: 'resistance',
      rationale: ['WEAKLEY_2022_CONCURRENT_DOSE'],
    },
    assumptions: [],
    review_triggers: [],
  };

  it('builds phase context with exercise library filtered for restrictions', () => {
    const skeleton = mockStrategy.phase_skeletons[0]!;
    const ctx = buildAiPhaseContext(profile, mockStrategy, skeleton, seedExercises, []);

    expect(ctx.phase_skeleton.phase_number).toBe(1);
    expect(ctx.phase_skeleton.phase_type).toBe('foundation');
    expect((ctx.exercise_library as unknown[]).length).toBeGreaterThan(0);
    expect(ctx.prior_phase_summaries).toEqual([]);
    expect((ctx.policies as Record<string, unknown>).progression_policy_id).toBe('prog-policy-1');
  });

  it('includes prior phase summaries when provided', () => {
    const skeleton = mockStrategy.phase_skeletons[0]!;
    const priorSummary = {
      phase_id: 'prev-phase',
      phase_type: 'foundation',
      objective: 'Build base',
      exercises_used: ['barbell_back_squat'],
      volume_per_muscle_group: { quadriceps: 12 },
      progression_model: 'double_progression',
    };
    const ctx = buildAiPhaseContext(profile, mockStrategy, skeleton, seedExercises, [priorSummary]);

    expect(ctx.prior_phase_summaries).toHaveLength(1);
  });
});

describe('summarisePhase', () => {
  it('extracts exercise IDs and volume per muscle group', () => {
    const phase = {
      phase_id: 'p1',
      phase_number: 1,
      name: 'Test',
      phase_type: 'foundation' as const,
      objective: 'Build base',
      start_week: 1,
      end_week: 1,
      weeks_count: 1,
      volume_direction: 'increase' as const,
      intensity_direction: 'maintain' as const,
      effort_direction: 'increase' as const,
      progression_model: 'double_progression' as const,
      weeks: [
        {
          days: [
            {
              exercises: [
                {
                  exercise_id: 'barbell_back_squat',
                  primary_muscles: ['quadriceps', 'glutes'],
                  sets: [
                    { set_type: 'working' },
                    { set_type: 'working' },
                    { set_type: 'working' },
                    { set_type: 'backoff' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const summary = summarisePhase(phase);
    expect(summary.phase_id).toBe('p1');
    expect(summary.exercises_used).toContain('barbell_back_squat');
    expect(summary.volume_per_muscle_group.quadriceps).toBe(3);
    expect(summary.volume_per_muscle_group.glutes).toBe(3);
  });
});
