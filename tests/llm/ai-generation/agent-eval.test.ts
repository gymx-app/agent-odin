/**
 * Real-world eval tests for the AI agent programme generation pipeline.
 *
 * These tests simulate production challenges: validation failures that force
 * retries, provider flakiness, edge-case athlete profiles, tool-calling
 * patterns, and the full orchestration loop including reasoning + replanning.
 */
import { describe, expect, it, vi, afterEach, type Mock } from 'vitest';
import { seedExercises } from '../../../fixtures/exercises/seed-exercises.js';
import {
  beginnerFatLossAthlete,
  advancedStrengthInBodyAthlete,
} from '../../../fixtures/athletes/valid-athletes.js';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import {
  generateAiProgramme,
  AiGenerationError,
  type AiGenerationInput,
} from '../../../src/llm/ai-generation/ai-programme-generation.service.js';
import type { AiProgrammeGenerationProvider } from '../../../src/llm/ai-generation/ai-programme-generation-provider.js';
import type {
  AiStrategyOutput,
  AiPhaseOutput,
  AiGenerationProviderContext,
} from '../../../src/llm/ai-generation/ai-generation.types.js';
import type { AiPhaseContext } from '../../../src/llm/ai-generation/ai-programme-generation-provider.js';
import { buildLongitudinalProgramme } from '../../../src/planning/longitudinal-programme-planner.js';
import {
  createToolExecutor,
  type ToolExecutor,
} from '../../../src/llm/ai-generation/agent-tool-executor.js';
import type { AthleteInput } from '../../../src/domain/athlete/athlete.types.js';

// ─── Shared mock ─────────────────────────────────────────────────

vi.mock(
  '../../../src/llm/ai-generation/validate-phase-in-isolation.js',
  () => ({
    validatePhaseInIsolation: vi.fn(() => []),
  }),
);

let validationMock: Mock;

const getValidationMock = async () => {
  if (!validationMock) {
    const mod =
      await import('../../../src/llm/ai-generation/validate-phase-in-isolation.js');
    validationMock = mod.validatePhaseInIsolation as unknown as Mock;
  }
  return validationMock;
};

afterEach(async () => {
  const mock = await getValidationMock();
  mock.mockImplementation(() => []);
});

// ─── Helpers ────────────────────────────────────────────────────────

const buildProviderFromAthlete = (
  athleteInput: AthleteInput,
  overrides?: {
    generateReasoningResult?: string;
  },
) => {
  const profile = normalizeAthlete(athleteInput);
  const result = buildLongitudinalProgramme(profile, seedExercises, {
    startDate: '2026-06-22',
    generatedAt: '2026-06-22T00:00:00.000Z',
    exerciseLibraryVersion: 'test-v1',
  });
  const programme = result.programme;

  const strategy: AiStrategyOutput = {
    programme: {
      name: programme.programme.name,
      goal_type: programme.programme.goal_type,
      goal_description: programme.programme.goal_description,
      target_weeks: programme.programme.target_weeks,
    },
    athlete_summary: programme.athlete_summary,
    strategy: programme.strategy,
    calendar: programme.calendar,
    phase_skeletons: programme.phases.map((p) => ({
      phase_id: p.phase_id,
      phase_number: p.phase_number,
      name: p.name,
      phase_type: p.phase_type,
      objective: p.objective,
      start_week: p.start_week,
      end_week: p.end_week,
      weeks_count: p.weeks_count,
      volume_direction: p.volume_direction,
      intensity_direction: p.intensity_direction,
      effort_direction: p.effort_direction,
      progression_model: p.progression_model,
    })),
    progression_policy: programme.progression_policy,
    fatigue_management_policy: programme.fatigue_management_policy,
    substitution_policy: programme.substitution_policy,
    conditioning_policy: programme.conditioning_policy,
    assumptions: programme.assumptions,
    review_triggers: programme.review_triggers,
  };

  const phasesByNumber = new Map(
    programme.phases.map((p) => [p.phase_number, p]),
  );

  const provider: AiProgrammeGenerationProvider = {
    generateStrategy: vi.fn(async () => ({
      output: strategy,
      provider: 'openai' as const,
      model: 'test-model',
      responseId: 'resp-s',
      usage: { inputTokens: 1000, outputTokens: 500 },
    })),
    generatePhase: vi.fn(async (context: AiPhaseContext) => {
      const phaseNum = context.phase_skeleton.phase_number;
      const phase = phasesByNumber.get(phaseNum)!;
      return {
        output: phase as AiPhaseOutput,
        provider: 'openai' as const,
        model: 'test-model',
        responseId: `resp-p-${phaseNum}`,
        usage: { inputTokens: 2000, outputTokens: 4000 },
      };
    }),
  };

  if (overrides?.generateReasoningResult !== undefined) {
    provider.generateReasoning = vi.fn(async () => ({
      reasoning: overrides.generateReasoningResult!,
      usage: { inputTokens: 300, outputTokens: 200 },
      provider: 'openai' as const,
      model: 'test-model',
    }));
  }

  return { provider, strategy, profile, programme };
};

const runGeneration = (
  athleteInput: AthleteInput,
  provider: AiProgrammeGenerationProvider,
  extra?: Partial<AiGenerationInput>,
) =>
  generateAiProgramme({
    profile: normalizeAthlete(athleteInput),
    exercises: seedExercises,
    provider,
    requestId: 'req-eval',
    startDate: '2026-06-22',
    exerciseLibraryVersion: 'test-v1',
    ...extra,
  });

// ═══════════════════════════════════════════════════════════════════
// 1. TOOL EXECUTOR — REAL WORLD EDGE CASES
// ═══════════════════════════════════════════════════════════════════

describe('Tool executor — real world edge cases', () => {
  const profile = normalizeAthlete(beginnerFatLossAthlete);
  const executor = createToolExecutor(seedExercises, profile);

  describe('searchExercises — empty results', () => {
    it('returns empty array for non-existent movement pattern', () => {
      const results = executor('searchExercises', {
        movement_pattern: 'backflip',
      }) as unknown[];
      expect(results).toEqual([]);
    });

    it('returns empty array when all filters combined eliminate everything', () => {
      const results = executor('searchExercises', {
        movement_pattern: 'squat',
        equipment: 'treadmill',
      }) as unknown[];
      expect(results).toEqual([]);
    });
  });

  describe('searchExercises — equipment constraints', () => {
    it('finds bodyweight exercises for minimal equipment', () => {
      const results = executor('searchExercises', {
        equipment: 'bodyweight',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(0);
      for (const ex of results) {
        expect(ex.equipment).toContain('bodyweight');
      }
    });

    it('barbell squat exercises exist in library', () => {
      const results = executor('searchExercises', {
        movement_pattern: 'squat',
        equipment: 'barbell',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((r) => r.exercise_id === 'barbell_back_squat')).toBe(
        true,
      );
    });

    it('finds cable exercises', () => {
      const results = executor('searchExercises', {
        equipment: 'cable',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(0);
    });

    it('finds machine exercises', () => {
      const results = executor('searchExercises', {
        equipment: 'machine',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('searchExercises — difficulty filtering', () => {
    it('beginner exercises are available', () => {
      const results = executor('searchExercises', {
        difficulty: 'beginner',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(5);
    });

    it('advanced exercises exist in the library', () => {
      const results = executor('searchExercises', {
        difficulty: 'advanced',
      }) as Array<Record<string, unknown>>;
      expect(results.length).toBeGreaterThan(0);
    });

    it('all difficulty tiers have exercises', () => {
      for (const diff of ['beginner', 'intermediate', 'advanced']) {
        const results = executor('searchExercises', {
          difficulty: diff,
        }) as unknown[];
        expect(results.length).toBeGreaterThan(0);
      }
    });
  });

  describe('checkVolumeCompliance — boundary conditions', () => {
    it('exactly at minimum is compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 4,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(true);
    });

    it('exactly at maximum is compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 12,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(true);
    });

    it('one below minimum is non-compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 3,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(false);
    });

    it('one above maximum is non-compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 13,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(false);
    });

    it('advanced trainees have wider volume range than beginners', () => {
      const begResult = executor('checkVolumeCompliance', {
        muscle_group: 'quadriceps',
        weekly_sets: 20,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      const advResult = executor('checkVolumeCompliance', {
        muscle_group: 'quadriceps',
        weekly_sets: 20,
        fitness_level: 'advanced',
      }) as Record<string, unknown>;
      expect(begResult.compliant).toBe(false);
      expect(advResult.compliant).toBe(true);
    });

    it('zero sets is non-compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 0,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(false);
    });

    it('negative sets is non-compliant', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: -5,
        fitness_level: 'beginner',
      }) as Record<string, unknown>;
      expect(result.compliant).toBe(false);
    });

    it('returns error for unknown fitness level', () => {
      const result = executor('checkVolumeCompliance', {
        muscle_group: 'chest',
        weekly_sets: 10,
        fitness_level: 'elite',
      }) as Record<string, unknown>;
      expect(result.error).toBeDefined();
    });
  });

  describe('getEvidenceRule — citation integrity', () => {
    it('every rule has at least one citation', () => {
      const keys = [
        'volume_fill_rates',
        'min_session_volume_fraction',
        'equipment_preference',
        'finisher_duration',
        'hiit_cycling',
        'beginner_hiit_exclusion',
        'untrained_strength_ratios',
        'novice_strength_ratios',
        'intermediate_strength_ratios',
        'pushup_norms',
      ];
      for (const key of keys) {
        const result = executor('getEvidenceRule', { rule_key: key }) as Record<
          string,
          unknown
        >;
        expect((result.citations as string[]).length).toBeGreaterThan(0);
      }
    });

    it('beginner_hiit_exclusion returns boolean true', () => {
      const result = executor('getEvidenceRule', {
        rule_key: 'beginner_hiit_exclusion',
      }) as Record<string, unknown>;
      expect(result.value).toBe(true);
    });

    it('strength ratios differ by sex', () => {
      const result = executor('getEvidenceRule', {
        rule_key: 'untrained_strength_ratios',
      }) as Record<string, unknown>;
      const ratios = result.value as Record<string, Record<string, number>>;
      const maleSquat = ratios.male!.squat!;
      const femaleSquat = ratios.female!.squat!;
      expect(maleSquat).toBeGreaterThan(femaleSquat);
    });

    it('returns error for unknown rule key', () => {
      const result = executor('getEvidenceRule', {
        rule_key: 'nonexistent_rule',
      }) as Record<string, unknown>;
      expect(result.error).toBeDefined();
      expect(result.error as string).toContain('Unknown evidence rule');
    });
  });

  describe('unknown tool', () => {
    it('returns error for unknown tool name', () => {
      const result = executor('unknownTool', {}) as Record<string, unknown>;
      expect(result.error).toContain('Unknown tool');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// 2. ORCHESTRATOR — DIVERSE ATHLETE PROFILES
// ═══════════════════════════════════════════════════════════════════

describe('Orchestrator — diverse athlete profiles', () => {
  it('generates programme for beginner fat-loss female', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(result.programme.schema_version).toBe('2.0');
    expect(result.programme.programme.goal_type).toBe('fat_loss');
    expect(result.phases.length).toBeGreaterThan(0);
    expect(result.total_input_tokens).toBeGreaterThan(0);
  });

  it('generates programme for advanced strength male with InBody data', async () => {
    const { provider } = buildProviderFromAthlete(
      advancedStrengthInBodyAthlete,
    );
    const result = await runGeneration(advancedStrengthInBodyAthlete, provider);

    expect(result.programme.programme.goal_type).toBe('strength');
    expect(result.phases.length).toBeGreaterThan(0);
  });

  it('generates programme for 3-day muscle gain male', async () => {
    const athlete: AthleteInput = {
      ...beginnerFatLossAthlete,
      name: '3-day Muscle Gain',
      sex: 'male',
      age: 25,
      goal: 'muscle_gain',
      available_days_per_week: 3,
      session_duration_min: 60,
      equipment: 'full_gym',
      fitness_level: 'beginner',
      current_weight_kg: 75,
      target_weight_kg: 80,
    };
    const { provider } = buildProviderFromAthlete(athlete);
    const result = await runGeneration(athlete, provider);

    expect(result.programme.programme.goal_type).toBe('muscle_gain');
    expect(result.phases.length).toBeGreaterThan(0);
  });

  it(
    'generates programme for 6-day advanced strength',
    { timeout: 15_000 },
    async () => {
      const athlete: AthleteInput = {
        ...advancedStrengthInBodyAthlete,
        available_days_per_week: 6,
      };
      const { provider } = buildProviderFromAthlete(athlete);
      const result = await runGeneration(athlete, provider);
      expect(result.phases.length).toBeGreaterThan(0);
    },
  );
});

// ═══════════════════════════════════════════════════════════════════
// 3. VALIDATION FEEDBACK LOOP — RETRY BEHAVIOUR
// ═══════════════════════════════════════════════════════════════════

describe('Validation feedback loop', () => {
  it('retries phase when validation returns errors, passes on 2nd attempt', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [
          {
            code: 'RPE_CEILING_BELOW_TARGET',
            severity: 'error',
            category: 'prescription_quality',
            message: 'RPE ceiling below target',
            phase_number: 1,
            day_of_week: 'MON',
            exercise_id: 'barbell_back_squat',
          },
        ];
      }
      return [];
    });

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(result.phases.length).toBe(programme.phases.length);
    // 1 extra call for the retry of phase 1
    expect(provider.generatePhase).toHaveBeenCalledTimes(
      programme.phases.length + 1,
    );
  });

  it('passes validation codes as retry feedback to the provider', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [
          {
            code: 'UNKNOWN_EXERCISE_ID',
            severity: 'error',
            category: 'exercise_integrity',
            message: 'Exercise "fake_exercise" not found',
            phase_number: 1,
            day_of_week: 'MON',
            exercise_id: 'fake_exercise',
          },
        ];
      }
      return [];
    });

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const retryCall = phaseCalls[1];
    expect(retryCall).toBeDefined();
    const providerCtx = retryCall![1] as AiGenerationProviderContext;
    expect(providerCtx.retryFeedback).toBeDefined();
    expect(providerCtx.retryFeedback!.validationCodes).toContain(
      'UNKNOWN_EXERCISE_ID',
    );
  });

  it('throws AiGenerationError after exhausting all retries and replans', async () => {
    const mock = await getValidationMock();
    mock.mockImplementation(() => [
      {
        code: 'DUPLICATE_EXERCISE_IN_SESSION',
        severity: 'error',
        category: 'exercise_integrity',
        message: 'Duplicate exercise',
        phase_number: 1,
        day_of_week: 'MON',
        exercise_id: 'barbell_back_squat',
      },
    ]);

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);

    await expect(
      runGeneration(beginnerFatLossAthlete, provider),
    ).rejects.toMatchObject({
      code: 'AI_PHASE_GENERATION_FAILED',
    });

    // All validation fails → continues past first phase, triggers replan, then fails again
    expect(provider.generateStrategy).toHaveBeenCalledTimes(2);
  });

  it('validation warnings do not trigger retries', async () => {
    const mock = await getValidationMock();
    mock.mockImplementation(() => [
      {
        code: 'PUSH_PULL_IMBALANCE',
        severity: 'warning',
        category: 'movement_balance',
        message: 'Slight imbalance',
        phase_number: 1,
        day_of_week: null,
        exercise_id: null,
      },
    ]);

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(result.phases.length).toBe(programme.phases.length);
    expect(provider.generatePhase).toHaveBeenCalledTimes(
      programme.phases.length,
    );
  });

  it('multiple validation errors are all included in retry feedback', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [
          {
            code: 'RPE_CEILING_BELOW_TARGET',
            severity: 'error',
            category: 'prescription_quality',
            message: 'RPE issue',
            phase_number: 1,
            day_of_week: null,
            exercise_id: null,
          },
          {
            code: 'DUPLICATE_EXERCISE_DISPLAY_ORDER',
            severity: 'error',
            category: 'structure',
            message: 'Display order conflict',
            phase_number: 1,
            day_of_week: null,
            exercise_id: null,
          },
        ];
      }
      return [];
    });

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const ctx = phaseCalls[1]![1] as AiGenerationProviderContext;
    expect(ctx.retryFeedback!.validationCodes).toHaveLength(2);
    expect(ctx.retryFeedback!.validationCodes).toContain(
      'RPE_CEILING_BELOW_TARGET',
    );
    expect(ctx.retryFeedback!.validationCodes).toContain(
      'DUPLICATE_EXERCISE_DISPLAY_ORDER',
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// 4. REPLANNING — STRATEGY RE-GENERATION
// ═══════════════════════════════════════════════════════════════════

describe('Replanning — strategy re-generation', () => {
  it('replans when a phase exhausts all retries', async () => {
    const mock = await getValidationMock();
    let totalAttempts = 0;

    // First 3 attempts fail (phase 1 × 3 retries), triggering replan, then all pass
    mock.mockImplementation(() => {
      totalAttempts++;
      if (totalAttempts <= 3) {
        return [
          {
            code: 'EXERCISE_DIFFICULTY_INAPPROPRIATE',
            severity: 'error',
            category: 'exercise_integrity',
            message: 'Wrong difficulty',
            phase_number: 1,
            day_of_week: null,
            exercise_id: null,
          },
        ];
      }
      return [];
    });

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(provider.generateStrategy).toHaveBeenCalledTimes(2);
    expect(result.phases.length).toBeGreaterThan(0);
    expect(result.stage_durations_ms).toHaveProperty('replan_strategy');
  });

  it('succeeds without replanning when retry fixes validation', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      // Only the first attempt for phase 1 fails, second succeeds
      if (callCount === 1) {
        return [
          {
            code: 'RPE_CEILING_BELOW_TARGET',
            severity: 'error',
            category: 'prescription_quality',
            message: 'RPE issue',
            phase_number: 1,
            day_of_week: null,
            exercise_id: null,
          },
        ];
      }
      return [];
    });

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    // No replan needed — retry fixed it
    expect(provider.generateStrategy).toHaveBeenCalledTimes(1);
    expect(result.phases.length).toBe(programme.phases.length);
  });

  it('passes failure feedback to replanned strategy generation', async () => {
    const mock = await getValidationMock();
    let totalAttempts = 0;

    // Phase 1 fails 3 times → triggers replan, then all pass
    mock.mockImplementation(() => {
      totalAttempts++;
      if (totalAttempts <= 3) {
        return [
          {
            code: 'CONDITIONING_TYPE_INVALID',
            severity: 'error',
            category: 'structure',
            message: 'Invalid conditioning type',
            phase_number: 1,
            day_of_week: 'SAT',
            exercise_id: null,
          },
        ];
      }
      return [];
    });

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const strategyCalls = (provider.generateStrategy as Mock).mock.calls;
    expect(strategyCalls.length).toBe(2);
    const replanCtx = strategyCalls[1]![1] as AiGenerationProviderContext;
    expect(replanCtx.retryFeedback).toBeDefined();
    expect(replanCtx.retryFeedback!.validationCodes).toContain(
      'CONDITIONING_TYPE_INVALID',
    );
  });

  it('max 1 replan — throws after replan also fails', async () => {
    const mock = await getValidationMock();
    mock.mockImplementation(() => [
      {
        code: 'MUSCLE_VOLUME_EXCESSIVE',
        severity: 'error',
        category: 'movement_balance',
        message: 'Volume exceeds MRV',
        phase_number: 1,
        day_of_week: null,
        exercise_id: null,
      },
    ]);

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);

    await expect(
      runGeneration(beginnerFatLossAthlete, provider),
    ).rejects.toMatchObject({ code: 'AI_PHASE_GENERATION_FAILED' });

    // 1 initial + 1 replan = 2 strategy calls max
    expect(provider.generateStrategy).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 5. REASONING — MULTI-TURN BEHAVIOUR
// ═══════════════════════════════════════════════════════════════════

describe('Reasoning — multi-turn behaviour', () => {
  it('reasoning output is passed to every phase generation call', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete, {
      generateReasoningResult: 'Phase should use full-body compound movements.',
    });

    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    for (const [, ctx] of phaseCalls) {
      expect(ctx.reasoningOutput).toBe(
        'Phase should use full-body compound movements.',
      );
    }
  });

  it('reasoning is called once per phase, not per retry', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return [
          {
            code: 'RPE_CEILING_BELOW_TARGET',
            severity: 'error',
            category: 'prescription_quality',
            message: 'RPE issue',
            phase_number: 1,
            day_of_week: null,
            exercise_id: null,
          },
        ];
      }
      return [];
    });

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
      {
        generateReasoningResult: 'Reasoning output.',
      },
    );

    await runGeneration(beginnerFatLossAthlete, provider);

    expect(provider.generateReasoning).toHaveBeenCalledTimes(
      programme.phases.length,
    );
    expect(provider.generatePhase).toHaveBeenCalledTimes(
      programme.phases.length + 1,
    );
  });

  it('reasoning tokens are tracked in total', async () => {
    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
      {
        generateReasoningResult: 'Focus on progressive overload.',
      },
    );

    const result = await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCount = programme.phases.length;
    expect(result.total_input_tokens).toBe(1000 + (300 + 2000) * phaseCount);
    expect(result.total_output_tokens).toBe(500 + (200 + 4000) * phaseCount);
  });

  it('works without reasoning when provider does not implement it', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    // No generateReasoning on provider
    expect(provider.generateReasoning).toBeUndefined();

    const result = await runGeneration(beginnerFatLossAthlete, provider);
    expect(result.phases.length).toBeGreaterThan(0);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    for (const [, ctx] of phaseCalls) {
      expect(ctx.reasoningOutput).toBeUndefined();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 6. TOOL EXECUTOR WIRING
// ═══════════════════════════════════════════════════════════════════

describe('Tool executor wiring', () => {
  it('toolExecutor is passed to every generatePhase call', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    for (const [, ctx] of phaseCalls) {
      expect(ctx.toolExecutor).toBeDefined();
      expect(typeof ctx.toolExecutor).toBe('function');
    }
  });

  it('toolExecutor is functional — can search exercises', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const toolExec = phaseCalls[0]![1].toolExecutor as ToolExecutor;
    const results = toolExec('searchExercises', {
      movement_pattern: 'squat',
    }) as unknown[];
    expect(results.length).toBeGreaterThan(0);
  });

  it('toolExecutor can check volume compliance', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const toolExec = phaseCalls[0]![1].toolExecutor as ToolExecutor;
    const result = toolExec('checkVolumeCompliance', {
      muscle_group: 'quadriceps',
      weekly_sets: 10,
      fitness_level: 'beginner',
    }) as Record<string, unknown>;
    expect(typeof result.compliant).toBe('boolean');
  });

  it('toolExecutor can get evidence rules', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const toolExec = phaseCalls[0]![1].toolExecutor as ToolExecutor;
    const result = toolExec('getEvidenceRule', {
      rule_key: 'volume_fill_rates',
    }) as Record<string, unknown>;
    expect(result.value).toBeDefined();
    expect(result.citations).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════
// 7. DEADLINE ENFORCEMENT
// ═══════════════════════════════════════════════════════════════════

describe('Deadline enforcement', () => {
  it('times out during strategy generation', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);

    await expect(
      runGeneration(beginnerFatLossAthlete, provider, {
        deadline: 50,
        now: () => 100,
      }),
    ).rejects.toMatchObject({
      code: 'AI_GENERATION_TIMEOUT',
      stage: 'strategy',
    });
  });

  it('times out mid-phase-loop', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    let callCount = 0;

    await expect(
      runGeneration(beginnerFatLossAthlete, provider, {
        deadline: 1000,
        now: () => {
          callCount++;
          return callCount < 6 ? 100 : 2000;
        },
      }),
    ).rejects.toMatchObject({
      code: 'AI_GENERATION_TIMEOUT',
    });
  });

  it('completes when deadline is generous', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);

    const result = await runGeneration(beginnerFatLossAthlete, provider, {
      deadline: Number.MAX_SAFE_INTEGER,
      now: () => 0,
    });

    expect(result.phases.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 8. PROVIDER RESILIENCE
// ═══════════════════════════════════════════════════════════════════

describe('Provider resilience', () => {
  it('provider throwing during strategy propagates', async () => {
    const provider: AiProgrammeGenerationProvider = {
      generateStrategy: vi.fn(async () => {
        throw new Error('Network timeout');
      }),
      generatePhase: vi.fn(),
    };
    await expect(
      runGeneration(beginnerFatLossAthlete, provider),
    ).rejects.toThrow('Network timeout');
  });

  it('provider throwing during phase propagates', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    (provider.generatePhase as Mock).mockRejectedValue(
      new Error('Rate limited'),
    );
    await expect(
      runGeneration(beginnerFatLossAthlete, provider),
    ).rejects.toThrow('Rate limited');
  });

  it('provider throwing during reasoning propagates', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    provider.generateReasoning = vi.fn(async () => {
      throw new Error('Reasoning model unavailable');
    });
    await expect(
      runGeneration(beginnerFatLossAthlete, provider),
    ).rejects.toThrow('Reasoning model unavailable');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 9. TOKEN TRACKING ACCURACY
// ═══════════════════════════════════════════════════════════════════

describe('Token tracking accuracy', () => {
  it('tracks tokens across strategy + all phases', async () => {
    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    const n = programme.phases.length;
    expect(result.total_input_tokens).toBe(1000 + 2000 * n);
    expect(result.total_output_tokens).toBe(500 + 4000 * n);
  });

  it('tracks extra tokens from retried phases', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? [
            {
              code: 'RPE_CEILING_BELOW_TARGET',
              severity: 'error',
              category: 'prescription_quality',
              message: 'RPE',
              phase_number: 1,
              day_of_week: null,
              exercise_id: null,
            },
          ]
        : [];
    });

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    const n = programme.phases.length;
    expect(result.total_input_tokens).toBe(1000 + 2000 * (n + 1));
    expect(result.total_output_tokens).toBe(500 + 4000 * (n + 1));
  });

  it('tracks tokens from replan strategy call', async () => {
    const mock = await getValidationMock();
    let totalAttempts = 0;
    mock.mockImplementation(() => {
      totalAttempts++;
      return totalAttempts <= 3
        ? [
            {
              code: 'MUSCLE_VOLUME_BELOW_REQUIRED',
              severity: 'error',
              category: 'movement_balance',
              message: 'Below minimum',
              phase_number: 1,
              day_of_week: null,
              exercise_id: null,
            },
          ]
        : [];
    });

    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    // 2 strategy calls = 2 × 1000 input
    expect(result.total_input_tokens).toBeGreaterThan(
      1000 + 2000 * programme.phases.length,
    );
    expect(provider.generateStrategy).toHaveBeenCalledTimes(2);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 10. STAGE DURATION TRACKING
// ═══════════════════════════════════════════════════════════════════

describe('Stage duration tracking', () => {
  it('records strategy and phase durations', async () => {
    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(typeof result.stage_durations_ms.strategy).toBe('number');
    for (let i = 1; i <= programme.phases.length; i++) {
      expect(result.stage_durations_ms).toHaveProperty(`phase_${i}`);
    }
  });

  it('records replan_strategy duration when replanning occurs', async () => {
    const mock = await getValidationMock();
    let totalAttempts = 0;
    mock.mockImplementation(() => {
      totalAttempts++;
      return totalAttempts <= 3
        ? [
            {
              code: 'CONDITIONING_MODALITY_EXCLUDED',
              severity: 'error',
              category: 'structure',
              message: 'Excluded modality',
              phase_number: 1,
              day_of_week: null,
              exercise_id: null,
            },
          ]
        : [];
    });

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    const result = await runGeneration(beginnerFatLossAthlete, provider);

    expect(result.stage_durations_ms).toHaveProperty('replan_strategy');
    expect(typeof result.stage_durations_ms.replan_strategy).toBe('number');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 11. PROGRAMME OUTPUT INTEGRITY
// ═══════════════════════════════════════════════════════════════════

describe('Programme output integrity', () => {
  it('assembled programme has schema_version 2.0 and deterministic: false', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    const result = await runGeneration(beginnerFatLossAthlete, provider);
    expect(result.programme.schema_version).toBe('2.0');
    expect(result.programme.generation_metadata.deterministic).toBe(false);
  });

  it('phases in output match number of phase skeletons', async () => {
    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    const result = await runGeneration(beginnerFatLossAthlete, provider);
    expect(result.phases.length).toBe(programme.phases.length);
    expect(result.programme.phases.length).toBe(programme.phases.length);
  });

  it('strategy output is returned alongside programme', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    const result = await runGeneration(beginnerFatLossAthlete, provider);
    expect(result.strategy.programme.goal_type).toBe('fat_loss');
    expect(result.strategy.phase_skeletons.length).toBeGreaterThan(0);
    expect(result.strategy.calendar).toBeDefined();
  });

  it('programme goal matches athlete input for multiple goals', async () => {
    for (const [goal, athlete] of [
      ['fat_loss', beginnerFatLossAthlete],
      ['strength', advancedStrengthInBodyAthlete],
    ] as const) {
      const { provider } = buildProviderFromAthlete(athlete);
      const result = await runGeneration(athlete, provider);
      expect(result.programme.programme.goal_type).toBe(goal);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// 12. PHASE CONTEXT SHAPE
// ═══════════════════════════════════════════════════════════════════

describe('Phase context shape', () => {
  it('phase context contains tool_instructions instead of exercise_library', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const ctx = phaseCalls[0]![0] as AiPhaseContext;
    expect(ctx.tool_instructions).toContain('searchExercises');
    expect((ctx as Record<string, unknown>).exercise_library).toBeUndefined();
  });

  it('phase skeleton fields are passed through correctly', async () => {
    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const ctx = phaseCalls[0]![0] as AiPhaseContext;
    expect(ctx.phase_skeleton.phase_number).toBe(1);
    expect(ctx.phase_skeleton.phase_type).toBeTruthy();
    expect(ctx.phase_skeleton.objective).toBeTruthy();
    expect(ctx.phase_skeleton.weeks_count).toBeGreaterThan(0);
  });

  it('athlete context reflects the input profile', async () => {
    const { provider } = buildProviderFromAthlete(
      advancedStrengthInBodyAthlete,
    );
    await runGeneration(advancedStrengthInBodyAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    const ctx = phaseCalls[0]![0] as AiPhaseContext;
    const athlete = ctx.athlete as Record<string, unknown>;
    expect(athlete.goal).toBe('strength');
    expect(athlete.fitness_level).toBe('advanced');
    expect(athlete.equipment).toBe('full_gym');
  });

  it('prior_phase_summaries are provided to phase generation', async () => {
    const { provider, programme } = buildProviderFromAthlete(
      beginnerFatLossAthlete,
    );
    await runGeneration(beginnerFatLossAthlete, provider);

    const phaseCalls = (provider.generatePhase as Mock).mock.calls;
    expect(phaseCalls.length).toBe(programme.phases.length);

    const lastCtx = phaseCalls[phaseCalls.length - 1]![0] as AiPhaseContext;
    expect(lastCtx.prior_phase_summaries.length).toBe(programme.phases.length);
  });
});

// ═══════════════════════════════════════════════════════════════════
// 13. LOGGING
// ═══════════════════════════════════════════════════════════════════

describe('Logging', () => {
  it('logs all key events during generation', async () => {
    const logs: unknown[][] = [];
    const logger = { debug: (...args: unknown[]) => logs.push(args) };

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider, { logger });

    const eventNames = logs.map((l) => l[0] as string);
    expect(eventNames).toContain('ai_generation_strategy_attempt');
    expect(eventNames).toContain('ai_generation_strategy_complete');
    expect(eventNames).toContain('ai_generation_phase_attempt');
    expect(eventNames).toContain('ai_generation_phase_complete');
  });

  it('logs reasoning events when provider supports it', async () => {
    const logs: unknown[][] = [];
    const logger = { debug: (...args: unknown[]) => logs.push(args) };

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete, {
      generateReasoningResult: 'Reasoning...',
    });
    await runGeneration(beginnerFatLossAthlete, provider, { logger });

    const eventNames = logs.map((l) => l[0] as string);
    expect(eventNames).toContain('ai_generation_reasoning_start');
    expect(eventNames).toContain('ai_generation_reasoning_complete');
  });

  it('logs replan event when replanning occurs', async () => {
    const mock = await getValidationMock();
    let totalAttempts = 0;
    mock.mockImplementation(() => {
      totalAttempts++;
      return totalAttempts <= 3
        ? [
            {
              code: 'MUSCLE_VOLUME_EXCESSIVE',
              severity: 'error',
              category: 'movement_balance',
              message: 'Too much volume',
              phase_number: 1,
              day_of_week: null,
              exercise_id: null,
            },
          ]
        : [];
    });

    const logs: unknown[][] = [];
    const logger = { debug: (...args: unknown[]) => logs.push(args) };

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider, { logger });

    const eventNames = logs.map((l) => l[0] as string);
    expect(eventNames).toContain('ai_generation_replanning');
  });

  it('logs validation failure details on retry', async () => {
    const mock = await getValidationMock();
    let callCount = 0;
    mock.mockImplementation(() => {
      callCount++;
      return callCount === 1
        ? [
            {
              code: 'UNKNOWN_EXERCISE_ID',
              severity: 'error',
              category: 'exercise_integrity',
              message: 'Unknown exercise',
              phase_number: 1,
              day_of_week: null,
              exercise_id: null,
            },
          ]
        : [];
    });

    const logs: unknown[][] = [];
    const logger = { debug: (...args: unknown[]) => logs.push(args) };

    const { provider } = buildProviderFromAthlete(beginnerFatLossAthlete);
    await runGeneration(beginnerFatLossAthlete, provider, { logger });

    const failLog = logs.find(
      (l) => l[0] === 'ai_generation_phase_validation_failed',
    );
    expect(failLog).toBeDefined();
    const meta = failLog![1] as Record<string, unknown>;
    expect(meta.errors).toBe(1);
    expect(meta.codes as string[]).toContain('UNKNOWN_EXERCISE_ID');
  });
});

// ═══════════════════════════════════════════════════════════════════
// 14. CROSS-TOOL CONSISTENCY
// ═══════════════════════════════════════════════════════════════════

describe('Tool executor — cross-tool consistency', () => {
  const profile = normalizeAthlete(beginnerFatLossAthlete);
  const executor = createToolExecutor(seedExercises, profile);

  it('searchExercises returns exercises that checkVolumeCompliance can validate', () => {
    const squats = executor('searchExercises', {
      movement_pattern: 'squat',
    }) as Array<Record<string, unknown>>;
    expect(squats.length).toBeGreaterThan(0);

    const primaryMuscle = (squats[0]!.primary_muscles as string[])[0]!;
    const volumeCheck = executor('checkVolumeCompliance', {
      muscle_group: primaryMuscle,
      weekly_sets: 10,
      fitness_level: 'beginner',
    }) as Record<string, unknown>;
    expect(typeof volumeCheck.compliant).toBe('boolean');
  });

  it('evidence rule citations are consistent with volume check citations', () => {
    const volumeCheck = executor('checkVolumeCompliance', {
      muscle_group: 'chest',
      weekly_sets: 10,
      fitness_level: 'intermediate',
    }) as Record<string, unknown>;
    const rule = executor('getEvidenceRule', {
      rule_key: 'volume_fill_rates',
    }) as Record<string, unknown>;

    expect(volumeCheck.citations as string[]).toContain(
      'SCHOENFELD_2017_DOSE_RESPONSE',
    );
    expect(rule.citations as string[]).toContain(
      'SCHOENFELD_2017_DOSE_RESPONSE',
    );
  });

  it('all movement patterns in the library are searchable', () => {
    const patterns = new Set<string>();
    for (const ex of seedExercises) {
      for (const p of ex.movement_patterns) patterns.add(p);
    }
    for (const pattern of patterns) {
      const results = executor('searchExercises', {
        movement_pattern: pattern,
      }) as unknown[];
      expect(results.length).toBeGreaterThan(0);
    }
  });

  it('all primary muscles in the library are searchable', () => {
    const muscles = new Set<string>();
    for (const ex of seedExercises) {
      for (const m of ex.primary_muscles) muscles.add(m);
    }
    for (const muscle of muscles) {
      const results = executor('searchExercises', {
        muscle_group: muscle,
      }) as unknown[];
      expect(results.length).toBeGreaterThan(0);
    }
  });

  it('all equipment types in the library are searchable', () => {
    const equip = new Set<string>();
    for (const ex of seedExercises) {
      for (const e of ex.equipment) equip.add(e);
    }
    for (const eq of equip) {
      const results = executor('searchExercises', {
        equipment: eq,
      }) as unknown[];
      expect(results.length).toBeGreaterThan(0);
    }
  });
});
