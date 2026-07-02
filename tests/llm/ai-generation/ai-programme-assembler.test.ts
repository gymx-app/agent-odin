import { describe, expect, it } from 'vitest';
import { assembleProgramme } from '../../../src/llm/ai-generation/ai-programme-assembler.js';
import { applyWeightPrescription } from '../../../src/planning/weight-prescription.js';
import type { AiStrategyOutput, AiPhaseOutput } from '../../../src/llm/ai-generation/ai-generation.types.js';

const mockStrategy: AiStrategyOutput = {
  programme: {
    name: 'Assembled Test',
    goal_type: 'fat_loss',
    goal_description: 'Lose body fat while preserving muscle',
    target_weeks: 4,
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
    policy_id: 'prog-1',
    default_model: 'double_progression',
    success_condition: 'All sets at target',
    hold_condition: 'RPE too high',
    regression_condition: 'Missed reps twice',
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
    policy_id: 'cond-1',
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

describe('assembleProgramme', () => {
  it('produces a schema-version 2.0 programme with correct metadata', () => {
    const result = assembleProgramme({
      strategy: mockStrategy,
      phases: [],
      startDate: '2026-06-22',
      startWeightKg: 82,
      targetWeightKg: 74,
      exerciseLibraryVersion: 'test-v1',
      validationRuleVersion: 'programme-validation/v2',
    });

    expect(result.schema_version).toBe('2.0');
    expect(result.planner_version).toBe('longitudinal_v1');
    expect(result.programme.name).toBe('Assembled Test');
    expect(result.programme.start_date).toBe('2026-06-22');
    expect(result.programme.start_weight_kg).toBe(82);
    expect(result.programme.target_weight_kg).toBe(74);
    expect(result.programme.status).toBe('preview');
  });

  it('stamps generation_metadata with deterministic: false', () => {
    const result = assembleProgramme({
      strategy: mockStrategy,
      phases: [],
      startDate: '2026-06-22',
      startWeightKg: 82,
      targetWeightKg: 74,
      exerciseLibraryVersion: 'test-v1',
      validationRuleVersion: 'programme-validation/v2',
    });

    expect(result.generation_metadata.deterministic).toBe(false);
    expect(result.generation_metadata.exercise_library_version).toBe('test-v1');
    expect(result.generation_metadata.schema_version).toBe('2.0');
  });

  it('copies strategy, calendar, and all policies from the AI output', () => {
    const result = assembleProgramme({
      strategy: mockStrategy,
      phases: [],
      startDate: '2026-06-22',
      startWeightKg: 82,
      targetWeightKg: 74,
      exerciseLibraryVersion: 'test-v1',
      validationRuleVersion: 'programme-validation/v2',
    });

    expect(result.strategy.primary_objective).toBe('fat_loss');
    expect(result.calendar.cycle_type).toBe('weekly');
    expect(result.progression_policy.policy_id).toBe('prog-1');
    expect(result.conditioning_policy.policy_id).toBe('cond-1');
    expect(result.fatigue_management_policy.planned_deload_weeks).toEqual([4]);
  });

  it('initialises validation_summary as invalid (pre-validation placeholder)', () => {
    const result = assembleProgramme({
      strategy: mockStrategy,
      phases: [],
      startDate: '2026-06-22',
      startWeightKg: 82,
      targetWeightKg: 74,
      exerciseLibraryVersion: 'test-v1',
      validationRuleVersion: 'programme-validation/v2',
    });

    expect(result.validation_summary.passed).toBe(false);
    expect(result.validation_summary.status).toBe('invalid');
  });
});

describe('assemble step weight prescription (regression: known_lifts must populate weight_kg on the assemble path, not only build)', () => {
  const phasesWithCompoundLift = [
    {
      phase_id: 'phase-1',
      phase_number: 1,
      name: 'Foundation',
      phase_type: 'foundation',
      objective: 'Build base strength',
      start_week: 1,
      end_week: 1,
      weeks_count: 1,
      volume_direction: 'increase',
      intensity_direction: 'increase',
      effort_direction: 'increase',
      progression_model: 'double_progression',
      rationale: [],
      weeks: [
        {
          week_id: 'week-1',
          week_number: 1,
          days: [
            {
              day_id: 'day-1',
              cycle_day: 1,
              day_type: 'resistance',
              exercises: [
                {
                  prescription_id: 'rx-squat',
                  exercise_id: 'barbell_back_squat',
                  exercise_name: 'Barbell Back Squat',
                  display_order: 1,
                  sequence_role: 'primary',
                  weight_kg: null,
                },
                {
                  prescription_id: 'rx-accessory',
                  exercise_id: 'leg_press',
                  exercise_name: 'Leg Press',
                  display_order: 2,
                  sequence_role: 'accessory',
                  weight_kg: null,
                },
              ],
            },
          ],
        },
      ],
    },
  ] as unknown as AiPhaseOutput[];

  const assemble = () =>
    assembleProgramme({
      strategy: mockStrategy,
      phases: phasesWithCompoundLift,
      startDate: '2026-06-22',
      startWeightKg: 82,
      targetWeightKg: 74,
      exerciseLibraryVersion: 'test-v1',
      validationRuleVersion: 'programme-validation/v2',
    });

  it('leaves weight_kg null when applyWeightPrescription is not applied (pre-fix behaviour)', () => {
    const assembled = assemble();
    const exercise = assembled.phases[0]!.weeks[0]!.days[0]!.exercises[0]!;
    expect(exercise.weight_kg).toBeNull();
  });

  it('populates weight_kg on matching compound exercises when applyWeightPrescription is applied to the assembled phases', () => {
    const assembled = assemble();
    const phases = applyWeightPrescription(assembled.phases, {
      baseline_path: 'self_reported',
      known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
      goal: 'strength',
    });

    const [squat, accessory] = phases[0]!.weeks[0]!.days[0]!.exercises;
    // Epley: 100 * (1 + 5/30) = 116.67 estimated 1RM; strength working % = 0.825 → 97.5 (nearest 2.5kg)
    expect(squat!.weight_kg).toBe(97.5);
    expect(accessory!.weight_kg).toBeNull();
  });
});
