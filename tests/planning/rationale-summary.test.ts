import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import { buildRationaleSummary } from '../../src/planning/rationale-summary.js';
import type { AiStrategyOutput } from '../../src/llm/ai-generation/ai-generation.types.js';
import { createProfile } from './test-planning-utils.js';

const clone = () => structuredClone(validLongitudinalProgramme);

const baseAiStrategy = (): AiStrategyOutput => ({
  programme: {
    name: 'Test',
    goal_type: 'fat_loss',
    goal_description: 'Lose body fat',
    target_weeks: 4,
  },
  athlete_summary: {
    training_status: 'advanced',
    recovery_capacity: 'low',
    energy_availability: 'deficit',
    movement_limitation_level: 'none',
    sport_interference_risk: 'none',
    programme_confidence: 'high',
  },
  strategy: {
    primary_objective: 'fat_loss',
    periodization_model: 'simple_progressive',
    progression_model: 'double_progression',
    split_type: 'upper_lower',
    resistance_frequency: 6,
    conditioning_frequency: 3,
    cycle_length_days: 7,
    volume_strategy: 'conservative',
    intensity_strategy: 'moderate_loading',
    fatigue_strategy: 'readiness_triggered',
    conditioning_strategy: 'fat_loss_support',
    rationale: [
      {
        code: 'SPLIT_TYPE_DECISION',
        // The exact production bug: reasoning justifying a different split
        // than what the model actually committed to in split_type above.
        selected_value: 'push_pull_legs',
        reason:
          'Push/pull/legs is optimal for an advanced athlete training 6 days per week.',
        source_fields: ['available_days_per_week'],
        confidence: 'high',
      },
    ],
  },
  calendar: {
    cycle_type: 'weekly',
    cycle_length_days: 7,
    anchor_date: '2026-06-22',
    repeats: true,
    days: [],
  },
  phase_skeletons: [],
  progression_policy: {
    policy_id: 'p1',
    default_model: 'double_progression',
    success_condition: 'All sets at target',
    hold_condition: 'RPE too high',
    regression_condition: 'Missed reps twice',
    exercise_overrides: [],
    rationale: [],
  },
  fatigue_management_policy: {
    strategy: 'readiness_triggered',
    planned_deload_weeks: [],
    deload_adjustments: {},
    readiness_triggers: [],
    rationale: [],
  },
  substitution_policy: {
    allowed: true,
    preserve: 'movement_pattern',
    require_same_eligibility_status: true,
    rules: [],
  },
  conditioning_policy: {
    policy_id: 'c1',
    weekly_target_sessions: 3,
    primary_purpose: 'fat_loss_support',
    preferred_modalities: ['stationary_bike'],
    restricted_modalities: [],
    progression_model: 'duration_first',
    concurrent_training_priority: 'resistance',
    rationale: [],
  },
  assumptions: [],
  review_triggers: [],
});

describe('buildRationaleSummary — split decision reconciliation', () => {
  it('reconciles a SPLIT_TYPE_DECISION rationale entry that disagrees with the actual split_type', () => {
    const programme = clone();
    programme.strategy.split_type = 'upper_lower';
    const aiStrategy = baseAiStrategy();
    const profile = createProfile();
    profile.recovery_capacity = 'low';

    const summary = buildRationaleSummary(aiStrategy, programme, profile);

    const splitDecision = summary.ai_strategy.decisions.find(
      (d) => d.decision === 'split type decision',
    )!;
    expect(splitDecision.value).toBe('upper_lower');
    expect(splitDecision.reason).not.toContain('push_pull_legs');
    expect(splitDecision.reason).not.toContain('Push/pull/legs');
  });

  it('gives the safety-override reason when the reconciled profile requires it', () => {
    const programme = clone();
    programme.strategy.split_type = 'upper_lower';
    const aiStrategy = baseAiStrategy();
    const profile = createProfile();
    profile.recovery_capacity = 'low';

    const summary = buildRationaleSummary(aiStrategy, programme, profile);

    const splitDecision = summary.ai_strategy.decisions.find(
      (d) => d.decision === 'split type decision',
    )!;
    expect(splitDecision.reason).toContain('conservative safety default');
  });

  it('leaves a consistent SPLIT_TYPE_DECISION entry untouched', () => {
    const programme = clone();
    programme.strategy.split_type = 'push_pull_legs';
    const aiStrategy = baseAiStrategy();
    aiStrategy.strategy.rationale[0]!.selected_value = 'push_pull_legs';
    aiStrategy.strategy.rationale[0]!.reason = 'Original correct reasoning.';
    const profile = createProfile();

    const summary = buildRationaleSummary(aiStrategy, programme, profile);

    const splitDecision = summary.ai_strategy.decisions.find(
      (d) => d.decision === 'split type decision',
    )!;
    expect(splitDecision.value).toBe('push_pull_legs');
    expect(splitDecision.reason).toBe('Original correct reasoning.');
  });
});
