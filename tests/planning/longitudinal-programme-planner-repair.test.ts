import { describe, expect, it, vi } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { buildProgrammeWithRepair } from '../../src/planning/longitudinal-programme-planner.js';
import type { AiProgrammeGenerationProvider, AiStrategyContext } from '../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type { AiStrategyOutput } from '../../src/llm/ai-generation/ai-generation.types.js';
import { createProfile } from './test-planning-utils.js';

// Empty phase_skeletons reliably fails LongitudinalOdinProgrammeSchema validation,
// which is what drives buildProgrammeWithRepair into its LLM repair round-trip.
const invalidStrategy: AiStrategyOutput = {
  programme: { name: 'x', goal_type: 'fat_loss', goal_description: 'x', target_weeks: 4 },
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
      { cycle_day: 1, day_of_week: 'MON', planned_session_type: 'resistance', session_label: 'A' },
      { cycle_day: 2, day_of_week: 'TUE', planned_session_type: 'rest', session_label: 'Rest' },
      { cycle_day: 3, day_of_week: 'WED', planned_session_type: 'resistance', session_label: 'B' },
      { cycle_day: 4, day_of_week: 'THU', planned_session_type: 'rest', session_label: 'Rest' },
      { cycle_day: 5, day_of_week: 'FRI', planned_session_type: 'resistance', session_label: 'C' },
      { cycle_day: 6, day_of_week: 'SAT', planned_session_type: 'conditioning', session_label: 'Cond' },
      { cycle_day: 7, day_of_week: 'SUN', planned_session_type: 'rest', session_label: 'Rest' },
    ],
  },
  phase_skeletons: [],
  progression_policy: {
    policy_id: 'p1',
    default_model: 'double_progression',
    success_condition: 'x',
    hold_condition: 'x',
    regression_condition: 'x',
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
    policy_id: 'c1',
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

const strategyContext: AiStrategyContext = {
  athlete: {},
  evidence_rules: {},
  exercise_library_summary: {},
  constraints: {},
};

const fakeProvider = (generateStrategy: AiProgrammeGenerationProvider['generateStrategy']): AiProgrammeGenerationProvider => ({
  generateStrategy,
  generatePhase: () => {
    throw new Error('generatePhase should not be called by buildProgrammeWithRepair');
  },
});

describe('buildProgrammeWithRepair deadline enforcement', () => {
  it('fails fast with GENERATION_TIMEOUT instead of starting another repair call once the deadline has passed', async () => {
    const profile = createProfile({ available_days_per_week: 4, session_duration_min: 60 });
    const generateStrategy = vi.fn();

    await expect(
      buildProgrammeWithRepair(
        profile,
        seedExercises,
        invalidStrategy,
        fakeProvider(generateStrategy),
        strategyContext,
        { startDate: '2026-06-22', deadline: Date.now() - 1000 },
      ),
    ).rejects.toMatchObject({ code: 'GENERATION_TIMEOUT', httpStatus: 504 });

    expect(generateStrategy).not.toHaveBeenCalled();
  });

  it('still runs repair attempts normally when the deadline has not passed', async () => {
    const profile = createProfile({ available_days_per_week: 4, session_duration_min: 60 });
    const generateStrategy = vi.fn().mockResolvedValue({
      output: invalidStrategy,
      provider: 'openai',
      model: 'test-model',
      responseId: null,
      usage: { inputTokens: 0, outputTokens: 0 },
    });

    await expect(
      buildProgrammeWithRepair(
        profile,
        seedExercises,
        invalidStrategy,
        fakeProvider(generateStrategy),
        strategyContext,
        { startDate: '2026-06-22', deadline: Date.now() + 60_000 },
      ),
    ).rejects.toMatchObject({ code: 'PROGRAMME_SCHEMA_VALIDATION_FAILED' });

    expect(generateStrategy).toHaveBeenCalled();
  });
});
