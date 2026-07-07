import { LongitudinalOdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { AiStrategyOutput } from '../llm/ai-generation/ai-generation.types.js';
import type { AiProgrammeGenerationProvider } from '../llm/ai-generation/ai-programme-generation-provider.js';
import type { AiStrategyContext } from '../llm/ai-generation/ai-programme-generation-provider.js';
import { programmeValidationService } from '../validation/programme-validation.service.js';
import { LONGITUDINAL_VALIDATION_RULE_VERSION } from '../validation/longitudinal-validation-registry.js';
import { planTrainingCalendar } from './calendar/calendar-planner.js';
import { planConditioning } from './conditioning/conditioning-planner.js';
import { planProgrammePhases } from './phases/phase-planner.js';
import { PlannerError } from './planner-errors.js';
import { buildProgrammeResistanceSessions } from './sessions/session-builder.js';
import { selectProgrammeStrategyV2 } from './strategy/strategy-selector.js';
import type { TrainingStrategyV2 } from './strategy/strategy.types.js';
import { planProgrammeWeeks } from './weeks/week-progression-planner.js';

const MAX_REPAIR_ATTEMPTS = 2;

// Warning-severity codes that still trigger a bounded repair attempt even
// though the programme is already schema-valid and shippable as-is. Kept
// deliberately small — these are the ones worth spending an extra strategy
// call on, not every warning (most are legitimate, accepted trade-offs like
// EXCESSIVE_CONSECUTIVE_TRAINING_DAYS, which only fires when the density was
// already an explicit, documented exception).
const ESCALATED_WARNING_CODES = new Set(['HIGH_FATIGUE_MOVEMENT_OVERLAP']);

export type LongitudinalProgrammePlannerOptions = {
  startDate?: string;
  generatedAt?: string;
  exerciseLibraryVersion?: string;
  stageRunner?: <T>(stage: string, operation: () => T) => T;
  // Absolute Date.now()-comparable deadline for the whole repair loop in
  // buildProgrammeWithRepair. Each individual LLM call already has its own
  // per-call timeout, but nothing previously capped the *sum* of retries —
  // a validation failure could trigger a full strategy regeneration call
  // (as slow as the original strategy call), up to MAX_REPAIR_ATTEMPTS
  // times, with no aggregate budget. That let requests run past the
  // platform's own function timeout and get killed uncleanly instead of
  // failing with a clean 504.
  deadline?: number;
  now?: () => number;
  onRepairAttempt?: (event: {
    attempt: number;
    outcome:
      | 'schema_invalid'
      | 'validation_failed'
      | 'repaired'
      | 'succeeded'
      | 'deadline_exceeded';
    errorCodes?: string[];
    elapsedMs: number;
  }) => void;
};

const initialSchedule = (profile: NormalizedAthleteProfile) => {
  const days = profile.source.available_days_per_week;
  const conditioning =
    profile.source.goal === 'endurance'
      ? 2
      : profile.source.goal === 'fat_loss'
        ? 1
        : 0;

  let resistance: number;
  if (days === 7) {
    resistance = profile.source.goal === 'endurance' ? 3 : 5;
  } else if (
    days === 6 &&
    profile.source.fitness_level !== 'beginner' &&
    profile.recovery_capacity !== 'low'
  ) {
    resistance = 6 - conditioning;
  } else {
    resistance = Math.max(
      2,
      Math.min(
        days - Math.min(conditioning, 1),
        profile.source.goal === 'endurance' ? 3 : days <= 5 ? 4 : days,
      ),
    );
  }

  const splitType =
    resistance <= 3
      ? ('full_body' as const)
      : resistance === 4
        ? ('upper_lower' as const)
        : resistance === 6
          ? ('push_pull_legs' as const)
          : ('hybrid' as const);

  return {
    split_type: splitType,
    resistance_frequency: resistance,
    conditioning_frequency: conditioning,
    cycle_length_days: 7,
  };
};

const validationSummary = (
  validation: ReturnType<typeof programmeValidationService.validateVersioned>,
): LongitudinalOdinProgramme['validation_summary'] => ({
  passed: validation.passed,
  status: validation.passed
    ? validation.summary.warning_count > 0
      ? 'valid_with_warnings'
      : 'valid'
    : 'invalid',
  overall_score: validation.overall_score,
  category_scores: validation.scores,
  warnings: validation.findings
    .filter((item) => item.severity !== 'info')
    .map((item) => ({
      code: item.code,
      severity: item.severity === 'error' ? 'error' : 'warning',
      message: item.message,
    })),
  validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
});

export const buildLongitudinalProgramme = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  options: LongitudinalProgrammePlannerOptions = {},
): {
  programme: LongitudinalOdinProgramme;
  validation: ReturnType<typeof programmeValidationService.validateVersioned>;
} => {
  const startDate = options.startDate ?? '2026-01-01';
  const generatedAt = options.generatedAt ?? `${startDate}T00:00:00.000Z`;
  const run =
    options.stageRunner ??
    (<T>(_stage: string, operation: () => T): T => operation());
  const schedule = run('strategy', () => initialSchedule(profile));
  const calendar = run(
    'calendar',
    () =>
      planTrainingCalendar({
        profile,
        strategy: schedule,
        cycleAnchorDate: startDate,
      }).calendar,
  );
  const strategy = run(
    'strategy_selection',
    () => selectProgrammeStrategyV2({ profile, calendar }).strategy,
  );
  const phasePlan = run('phases', () =>
    planProgrammePhases({ profile, strategy, calendar }),
  );
  const weekPlan = run('weeks', () =>
    planProgrammeWeeks({
      profile,
      strategy,
      calendar,
      phases: phasePlan.phases,
      planned_deload_weeks: phasePlan.planned_deload_weeks,
    }),
  );
  const resistancePhases = run('sessions', () =>
    buildProgrammeResistanceSessions({
      profile,
      strategy,
      phases: weekPlan.phases,
      exercises,
    }),
  );
  run('warmup_and_sequence', () => resistancePhases);
  const conditioning = run('conditioning', () =>
    planConditioning({
      profile,
      strategy,
      calendar,
      phases: resistancePhases,
    }),
  );
  const progressionModel =
    weekPlan.weeks[0]?.planning_metadata.progression_policy.model ??
    strategy.progression_model;
  const candidate = run<LongitudinalOdinProgramme>('composition', () => ({
    schema_version: '2.0',
    planner_version: 'longitudinal_v1',
    programme: {
      name: `${profile.source.goal.replaceAll('_', ' ')} programme`
        .replace(/\b\w/g, (character) => character.toUpperCase())
        .slice(0, 60),
      goal_type: profile.source.goal,
      goal_description: `Deterministic longitudinal ${profile.source.goal.replaceAll('_', ' ')} programme.`,
      start_date: startDate,
      target_weeks: profile.programme_horizon_weeks,
      start_weight_kg: profile.source.current_weight_kg,
      target_weight_kg: profile.source.target_weight_kg,
      status: 'preview',
    },
    athlete_summary: {
      training_status: profile.athlete_state.training_status.value,
      recovery_capacity: profile.recovery_capacity,
      energy_availability: profile.athlete_state.energy_availability.value,
      movement_limitation_level:
        profile.athlete_state.movement_limitation_level.value,
      sport_interference_risk:
        profile.athlete_state.sport_interference_risk.value,
      programme_confidence: profile.programme_confidence,
    },
    strategy,
    calendar,
    phases: conditioning.phases,
    progression_policy: {
      policy_id: 'default-progression',
      default_model: progressionModel,
      success_condition:
        'Complete all exact prescribed sets at or below the RPE ceiling.',
      hold_condition: 'Hold after RPE overshoot or missed target repetitions.',
      regression_condition: 'Regress after repeated missed prescriptions.',
      exercise_overrides: [],
      rationale: weekPlan.progression_plan.rationale.map((item) => item.reason),
    },
    fatigue_management_policy: phasePlan.fatigue_management_policy,
    substitution_policy: {
      allowed: true,
      preserve: 'movement_pattern',
      require_same_eligibility_status: true,
      rules: [
        'Use approved exercise IDs only.',
        'Preserve athlete eligibility and movement intent.',
      ],
    },
    conditioning_policy: conditioning.conditioning_policy,
    assumptions: profile.planning_assumptions.map((assumption) => ({
      code: assumption.code,
      message: assumption.message,
      confidence: assumption.confidence,
      source_fields: assumption.source_fields,
    })),
    review_triggers: [
      {
        code: 'PROGRAMME_COMPLETION_REVIEW',
        message: 'Review outcomes before generating the next programme.',
        trigger_type: 'programme_completion',
      },
    ],
    validation_summary: {
      passed: false,
      status: 'invalid',
      overall_score: 0,
      category_scores: {},
      warnings: [],
      validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
    },
    generation_metadata: {
      generated_at: generatedAt,
      planner_version: 'longitudinal_v1',
      schema_version: '2.0',
      exercise_library_version:
        options.exerciseLibraryVersion ?? 'approved-library-v1',
      validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
      deterministic: true,
    },
  }));
  const parsed = run('validation', () =>
    LongitudinalOdinProgrammeSchema.safeParse(candidate),
  );
  if (!parsed.success) {
    throw new PlannerError(
      'PROGRAMME_SCHEMA_VALIDATION_FAILED',
      'Generated longitudinal programme failed schema validation.',
      parsed.error.issues,
    );
  }
  const result = run('repair', () =>
    programmeValidationService.validateAndRepairVersioned({
      programme: parsed.data,
      profile,
      exercises,
    }),
  );
  if (result.programme.schema_version !== '2.0' || !result.validation.passed) {
    throw new PlannerError(
      'PROGRAMME_REPAIR_FAILED',
      'Generated longitudinal programme remained invalid after bounded repair.',
      {
        status: result.validation.status,
        summary: result.validation.summary,
        finding_codes: result.validation.findings.map((item) => item.code),
      },
    );
  }
  const programme = run('final_validation', () =>
    LongitudinalOdinProgrammeSchema.parse({
      ...result.programme,
      validation_summary: validationSummary(result.validation),
    }),
  );
  return { programme, validation: result.validation };
};

const mapAiStrategyToTrainingStrategy = (
  ai: AiStrategyOutput['strategy'],
): TrainingStrategyV2 => ({
  primary_objective: ai.primary_objective,
  periodization_model: ai.periodization_model,
  progression_model: ai.progression_model,
  split_type: ai.split_type,
  resistance_frequency: ai.resistance_frequency,
  conditioning_frequency: ai.conditioning_frequency,
  cycle_length_days: ai.cycle_length_days,
  volume_strategy: ai.volume_strategy,
  intensity_strategy: ai.intensity_strategy,
  fatigue_strategy: ai.fatigue_strategy,
  conditioning_strategy: ai.conditioning_strategy,
  rationale: ai.rationale,
});

type ValidationResult = ReturnType<
  typeof programmeValidationService.validateVersioned
>;
type ValidationFinding = ValidationResult['findings'][number];

type BuildResult =
  | {
      programme: LongitudinalOdinProgramme;
      validation: ValidationResult;
      errorFindings: ValidationFinding[];
      escalatedFindings: ValidationFinding[];
    }
  | {
      programme: null;
      validation: ValidationResult;
      errorFindings: ValidationFinding[];
      escalatedFindings: ValidationFinding[];
    };

export const buildProgrammeFromAiStrategy = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  aiStrategy: AiStrategyOutput,
  options: LongitudinalProgrammePlannerOptions = {},
): BuildResult => {
  const startDate = options.startDate ?? new Date().toISOString().slice(0, 10);
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const run =
    options.stageRunner ??
    (<T>(_stage: string, operation: () => T): T => operation());

  const strategy = run('strategy', () =>
    mapAiStrategyToTrainingStrategy(aiStrategy.strategy),
  );

  const calendar = run(
    'calendar',
    () =>
      planTrainingCalendar({
        profile,
        strategy,
        cycleAnchorDate: startDate,
      }).calendar,
  );

  const phases = aiStrategy.phase_skeletons.map((sk) => ({
    phase_id: sk.phase_id,
    phase_number: sk.phase_number,
    name: sk.name,
    phase_type: sk.phase_type,
    objective: sk.objective,
    start_week: sk.start_week,
    end_week: sk.end_week,
    weeks_count: sk.weeks_count,
    volume_direction: sk.volume_direction,
    intensity_direction: sk.intensity_direction,
    effort_direction: sk.effort_direction,
    progression_model: sk.progression_model,
    rationale: [
      {
        code: `AI_PHASE_${sk.phase_type.toUpperCase()}`,
        selected_value: sk.name,
        reason: sk.objective,
        source_fields: ['ai_strategy'],
        confidence: 'high' as const,
      },
    ],
  }));

  const planned_deload_weeks =
    aiStrategy.fatigue_management_policy.planned_deload_weeks;

  const weekPlan = run('weeks', () =>
    planProgrammeWeeks({
      profile,
      strategy,
      calendar,
      phases,
      planned_deload_weeks,
    }),
  );

  const resistancePhases = run('sessions', () =>
    buildProgrammeResistanceSessions({
      profile,
      strategy,
      phases: weekPlan.phases,
      exercises,
    }),
  );

  const conditioning = run('conditioning', () =>
    planConditioning({
      profile,
      strategy,
      calendar,
      phases: resistancePhases,
    }),
  );

  const progressionModel =
    weekPlan.weeks[0]?.planning_metadata.progression_policy.model ??
    strategy.progression_model;

  const candidate = run<LongitudinalOdinProgramme>('composition', () => ({
    schema_version: '2.0',
    planner_version: 'ai_agent_v1',
    programme: {
      name: aiStrategy.programme.name,
      goal_type: aiStrategy.programme.goal_type,
      goal_description: aiStrategy.programme.goal_description,
      start_date: startDate,
      target_weeks: aiStrategy.programme.target_weeks,
      start_weight_kg: profile.source.current_weight_kg,
      target_weight_kg: profile.source.target_weight_kg,
      status: 'preview',
    },
    athlete_summary: {
      training_status: aiStrategy.athlete_summary.training_status,
      recovery_capacity: aiStrategy.athlete_summary.recovery_capacity,
      energy_availability: aiStrategy.athlete_summary.energy_availability,
      movement_limitation_level:
        aiStrategy.athlete_summary.movement_limitation_level,
      sport_interference_risk:
        aiStrategy.athlete_summary.sport_interference_risk,
      programme_confidence: aiStrategy.athlete_summary.programme_confidence,
    },
    strategy,
    calendar,
    phases: conditioning.phases,
    progression_policy: {
      policy_id: 'default-progression',
      default_model: progressionModel,
      success_condition: aiStrategy.progression_policy.success_condition,
      hold_condition: aiStrategy.progression_policy.hold_condition,
      regression_condition: aiStrategy.progression_policy.regression_condition,
      exercise_overrides: [],
      rationale: aiStrategy.progression_policy.rationale,
    },
    fatigue_management_policy: {
      strategy: aiStrategy.fatigue_management_policy.strategy,
      planned_deload_weeks,
      deload_adjustments:
        aiStrategy.fatigue_management_policy.deload_adjustments,
      readiness_triggers:
        aiStrategy.fatigue_management_policy.readiness_triggers,
      rationale: aiStrategy.fatigue_management_policy.rationale,
    },
    substitution_policy: aiStrategy.substitution_policy,
    conditioning_policy: conditioning.conditioning_policy,
    assumptions: aiStrategy.assumptions,
    review_triggers: aiStrategy.review_triggers,
    validation_summary: {
      passed: false,
      status: 'invalid',
      overall_score: 0,
      category_scores: {},
      warnings: [],
      validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
    },
    generation_metadata: {
      generated_at: generatedAt,
      planner_version: 'ai_agent_v1',
      schema_version: '2.0',
      exercise_library_version:
        options.exerciseLibraryVersion ?? 'approved-library-v1',
      validation_rule_version: LONGITUDINAL_VALIDATION_RULE_VERSION,
      deterministic: false,
    },
  }));

  const parsed = run('validation', () =>
    LongitudinalOdinProgrammeSchema.safeParse(candidate),
  );
  if (!parsed.success) {
    throw new PlannerError(
      'PROGRAMME_SCHEMA_VALIDATION_FAILED',
      'AI-strategy-driven programme failed schema validation.',
      parsed.error.issues,
    );
  }

  const result = run('repair', () =>
    programmeValidationService.validateAndRepairVersioned({
      programme: parsed.data,
      profile,
      exercises,
    }),
  );

  const errorFindings = result.validation.findings.filter(
    (f) => f.severity === 'error',
  );

  if (result.programme.schema_version !== '2.0' || !result.validation.passed) {
    return {
      programme: null,
      validation: result.validation,
      errorFindings,
      escalatedFindings: [],
    };
  }

  const programme = run('final_validation', () =>
    LongitudinalOdinProgrammeSchema.parse({
      ...result.programme,
      validation_summary: validationSummary(result.validation),
    }),
  );

  const escalatedFindings = result.validation.findings.filter(
    (f) => f.severity === 'warning' && ESCALATED_WARNING_CODES.has(f.code),
  );

  return {
    programme,
    validation: result.validation,
    errorFindings: [],
    escalatedFindings,
  };
};

export type RepairAttempt = {
  attempt: number;
  errorCodes: string[];
  repaired: boolean;
};

export type BuildWithRepairResult = {
  programme: LongitudinalOdinProgramme;
  validation: ReturnType<typeof programmeValidationService.validateVersioned>;
  repair_log: RepairAttempt[];
  // 0/null when the strategy passed on the first attempt — no repair call
  // means no LLM call in this function at all (the strategy itself was
  // already generated in a prior step).
  totalInputTokens: number;
  totalOutputTokens: number;
  provider: 'openai' | 'anthropic' | null;
  model: string | null;
};

export const buildProgrammeWithRepair = async (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  aiStrategy: AiStrategyOutput,
  provider: AiProgrammeGenerationProvider,
  strategyContext: AiStrategyContext,
  options: LongitudinalProgrammePlannerOptions = {},
): Promise<BuildWithRepairResult> => {
  const repairLog: RepairAttempt[] = [];
  let currentStrategy = aiStrategy;
  const now = options.now ?? Date.now;
  const startedAt = now();
  const { deadline } = options;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let lastProvider: 'openai' | 'anthropic' | null = null;
  let lastModel: string | null = null;
  // A schema-valid programme is always shippable, even if it still carries an
  // escalated warning. Track the best one seen so a repair attempt aimed at
  // clearing that warning can never regress into a hard failure — if the
  // retry produces something worse (or invalid), we fall back to this
  // instead of throwing.
  let bestValidResult: {
    programme: LongitudinalOdinProgramme;
    validation: ValidationResult;
  } | null = null;

  // Each provider.generateStrategy retry call has its own per-call timeout,
  // but nothing previously capped how many of those could run back-to-back.
  // A validation failure could trigger a full strategy regeneration (as
  // slow as the original strategy call) up to MAX_REPAIR_ATTEMPTS times,
  // blowing past the platform's own function timeout with no clean error.
  // Throws a PlannerError (not an HTTP-layer odinError) — the caller maps
  // PROGRAMME_GENERATION_DEADLINE_EXCEEDED to a 504 GENERATION_TIMEOUT.
  const assertWithinDeadline = (attempt: number): void => {
    if (deadline === undefined || now() < deadline) return;
    const elapsedMs = now() - startedAt;
    options.onRepairAttempt?.({ attempt, outcome: 'deadline_exceeded', elapsedMs });
    throw new PlannerError(
      'PROGRAMME_GENERATION_DEADLINE_EXCEEDED',
      `Programme generation exceeded its time budget after ${attempt + 1} attempt(s).`,
      { attempt, repair_log: repairLog },
    );
  };

  for (let attempt = 0; attempt <= MAX_REPAIR_ATTEMPTS; attempt++) {
    assertWithinDeadline(attempt);
    let result: ReturnType<typeof buildProgrammeFromAiStrategy>;
    try {
      result = buildProgrammeFromAiStrategy(
        profile,
        exercises,
        currentStrategy,
        options,
      );
    } catch (err) {
      // Schema-level failure: the assembled candidate didn't match
      // LongitudinalOdinProgrammeSchema. Treat as a retryable attempt so the
      // repair loop can regenerate the strategy and try again.
      if (
        err instanceof PlannerError &&
        err.code === 'PROGRAMME_SCHEMA_VALIDATION_FAILED'
      ) {
        repairLog.push({
          attempt,
          errorCodes: ['PROGRAMME_SCHEMA_VALIDATION_FAILED'],
          repaired: false,
        });
        options.onRepairAttempt?.({
          attempt,
          outcome: 'schema_invalid',
          errorCodes: ['PROGRAMME_SCHEMA_VALIDATION_FAILED'],
          elapsedMs: now() - startedAt,
        });
        if (attempt === MAX_REPAIR_ATTEMPTS) throw err;
        assertWithinDeadline(attempt);
        const repaired = await provider.generateStrategy(strategyContext, {
          requestId: `repair-schema-${attempt + 1}`,
          retryFeedback: {
            validationCodes: ['PROGRAMME_SCHEMA_VALIDATION_FAILED'],
            messages: [
              'Generated programme failed schema validation. Revise the strategy to produce a structurally valid programme.',
            ],
            previousStrategy: currentStrategy,
          },
        });
        totalInputTokens += repaired.usage.inputTokens ?? 0;
        totalOutputTokens += repaired.usage.outputTokens ?? 0;
        lastProvider = repaired.provider;
        lastModel = repaired.model;
        currentStrategy = repaired.output;
        continue;
      }
      throw err;
    }

    if (result.programme) {
      bestValidResult = { programme: result.programme, validation: result.validation };

      if (result.escalatedFindings.length === 0) {
        options.onRepairAttempt?.({
          attempt,
          outcome: attempt > 0 ? 'repaired' : 'succeeded',
          elapsedMs: now() - startedAt,
        });
        if (attempt > 0) {
          repairLog.push({
            attempt,
            errorCodes: [],
            repaired: true,
          });
        }
        return {
          programme: result.programme,
          validation: result.validation,
          repair_log: repairLog,
          totalInputTokens,
          totalOutputTokens,
          provider: lastProvider,
          model: lastModel,
        };
      }

      // Schema-valid but carrying an escalated warning (e.g. overlapping
      // high-fatigue sessions). Worth one more attempt to clear it, but it's
      // already shippable — never let this branch throw.
      const escalatedCodes = result.escalatedFindings.map((f) => f.code);
      const escalatedMessages = result.escalatedFindings.map(
        (f) => `[${f.code}] ${f.message}`,
      );

      if (attempt === MAX_REPAIR_ATTEMPTS) {
        repairLog.push({ attempt, errorCodes: escalatedCodes, repaired: false });
        return {
          programme: bestValidResult.programme,
          validation: bestValidResult.validation,
          repair_log: repairLog,
          totalInputTokens,
          totalOutputTokens,
          provider: lastProvider,
          model: lastModel,
        };
      }

      repairLog.push({ attempt, errorCodes: escalatedCodes, repaired: false });
      assertWithinDeadline(attempt);
      const repairedStrategy = await provider.generateStrategy(strategyContext, {
        requestId: `repair-warning-${attempt + 1}`,
        retryFeedback: {
          validationCodes: escalatedCodes,
          messages: escalatedMessages,
          previousStrategy: currentStrategy,
        },
      });
      totalInputTokens += repairedStrategy.usage.inputTokens ?? 0;
      totalOutputTokens += repairedStrategy.usage.outputTokens ?? 0;
      lastProvider = repairedStrategy.provider;
      lastModel = repairedStrategy.model;
      currentStrategy = repairedStrategy.output;
      continue;
    }

    const errorCodes = result.errorFindings.map((f) => f.code);
    const errorMessages = result.errorFindings.map(
      (f) =>
        `[${f.code}] ${f.message}${f.phase_number != null ? ` (phase ${f.phase_number})` : ''}`,
    );

    repairLog.push({
      attempt,
      errorCodes,
      repaired: false,
    });
    options.onRepairAttempt?.({
      attempt,
      outcome: 'validation_failed',
      errorCodes,
      elapsedMs: now() - startedAt,
    });

    if (attempt === MAX_REPAIR_ATTEMPTS) {
      if (bestValidResult) {
        // A prior attempt was already shippable — prefer that over a hard
        // failure caused by a later attempt regressing.
        return {
          programme: bestValidResult.programme,
          validation: bestValidResult.validation,
          repair_log: repairLog,
          totalInputTokens,
          totalOutputTokens,
          provider: lastProvider,
          model: lastModel,
        };
      }
      throw new PlannerError(
        'PROGRAMME_REPAIR_EXHAUSTED',
        `AI-strategy-driven programme remained invalid after ${MAX_REPAIR_ATTEMPTS} repair attempts: ${errorCodes.join(', ')}`,
        {
          status: result.validation.status,
          summary: result.validation.summary,
          findings: result.errorFindings.map((f) => ({
            code: f.code,
            message: f.message,
            phase: f.phase_number,
          })),
          repair_log: repairLog,
        },
      );
    }

    assertWithinDeadline(attempt);
    const repaired = await provider.generateStrategy(strategyContext, {
      requestId: `repair-${attempt + 1}`,
      retryFeedback: {
        validationCodes: errorCodes,
        messages: errorMessages,
        previousStrategy: currentStrategy,
      },
    });
    totalInputTokens += repaired.usage.inputTokens ?? 0;
    totalOutputTokens += repaired.usage.outputTokens ?? 0;
    lastProvider = repaired.provider;
    lastModel = repaired.model;

    currentStrategy = repaired.output;
  }

  throw new PlannerError(
    'PROGRAMME_REPAIR_EXHAUSTED',
    'Unreachable: repair loop exited without result.',
  );
};
