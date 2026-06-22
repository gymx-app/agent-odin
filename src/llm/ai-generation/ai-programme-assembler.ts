import type { LongitudinalOdinProgramme } from '../../domain/programme/programme.types.js';
import type { AiStrategyOutput, AiPhaseOutput } from './ai-generation.types.js';

export type AssemblerInput = {
  strategy: AiStrategyOutput;
  phases: AiPhaseOutput[];
  startDate: string;
  startWeightKg: number;
  targetWeightKg: number;
  exerciseLibraryVersion: string;
  validationRuleVersion: string;
};

export const assembleProgramme = (
  input: AssemblerInput,
): LongitudinalOdinProgramme => {
  const now = new Date().toISOString();

  return {
    schema_version: '2.0',
    planner_version: 'longitudinal_v1',
    programme: {
      name: input.strategy.programme.name,
      goal_type: input.strategy.programme.goal_type,
      goal_description: input.strategy.programme.goal_description,
      start_date: input.startDate,
      target_weeks: input.strategy.programme.target_weeks,
      start_weight_kg: input.startWeightKg,
      target_weight_kg: input.targetWeightKg,
      status: 'preview',
    },
    athlete_summary: input.strategy.athlete_summary,
    strategy: input.strategy.strategy,
    calendar: input.strategy.calendar,
    phases: input.phases,
    progression_policy: input.strategy.progression_policy,
    fatigue_management_policy: input.strategy.fatigue_management_policy,
    substitution_policy: input.strategy.substitution_policy,
    conditioning_policy: input.strategy.conditioning_policy,
    assumptions: input.strategy.assumptions,
    review_triggers: input.strategy.review_triggers,
    validation_summary: {
      passed: false,
      status: 'invalid',
      overall_score: 0,
      category_scores: {},
      warnings: [],
      validation_rule_version: input.validationRuleVersion,
    },
    generation_metadata: {
      generated_at: now,
      planner_version: 'longitudinal_v1',
      schema_version: '2.0',
      exercise_library_version: input.exerciseLibraryVersion,
      validation_rule_version: input.validationRuleVersion,
      deterministic: false,
    },
  };
};
