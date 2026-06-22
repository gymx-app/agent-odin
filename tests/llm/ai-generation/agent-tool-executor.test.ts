import { describe, expect, it } from 'vitest';
import { createToolExecutor } from '../../../src/llm/ai-generation/agent-tool-executor.js';
import { seedExercises } from '../../../fixtures/exercises/seed-exercises.js';
import { createProfile } from '../../planning/test-planning-utils.js';

const profile = createProfile({
  available_days_per_week: 4,
  session_duration_min: 60,
});

const executor = createToolExecutor(seedExercises, profile);

describe('searchExercises', () => {
  it('returns exercises matching a movement pattern', () => {
    const results = executor('searchExercises', { movement_pattern: 'squat' }) as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.movement_patterns).toContain('squat');
    }
  });

  it('returns exercises matching a muscle group', () => {
    const results = executor('searchExercises', { muscle_group: 'chest' }) as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.primary_muscles).toContain('chest');
    }
  });

  it('returns exercises matching equipment', () => {
    const results = executor('searchExercises', { equipment: 'barbell' }) as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.equipment).toContain('barbell');
    }
  });

  it('filters by difficulty', () => {
    const results = executor('searchExercises', { difficulty: 'beginner' }) as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.difficulty).toBe('beginner');
    }
  });

  it('respects limit parameter', () => {
    const results = executor('searchExercises', { limit: 3 }) as Array<Record<string, unknown>>;
    expect(results.length).toBeLessThanOrEqual(3);
  });

  it('caps limit at 50', () => {
    const results = executor('searchExercises', { limit: 100 }) as Array<Record<string, unknown>>;
    expect(results.length).toBeLessThanOrEqual(50);
  });

  it('defaults limit to 20', () => {
    const results = executor('searchExercises', {}) as Array<Record<string, unknown>>;
    expect(results.length).toBeLessThanOrEqual(20);
  });

  it('returns exercise_id and exercise_name in results', () => {
    const results = executor('searchExercises', { movement_pattern: 'hinge' }) as Array<Record<string, unknown>>;
    expect(results.length).toBeGreaterThan(0);
    for (const ex of results) {
      expect(ex.exercise_id).toBeDefined();
      expect(ex.exercise_name).toBeDefined();
    }
  });

  it('filters out exercises with avoid restrictions', () => {
    const restrictedProfile = createProfile({
      injuries: [{ area: 'knee', severity: 'avoid', notes: 'ACL reconstruction' }],
    });
    const restrictedExecutor = createToolExecutor(seedExercises, restrictedProfile);
    const results = restrictedExecutor('searchExercises', {}) as Array<Record<string, unknown>>;
    const unrestricted = executor('searchExercises', {}) as Array<Record<string, unknown>>;
    expect(results.length).toBeLessThanOrEqual(unrestricted.length);
  });

  it('combines multiple filters', () => {
    const results = executor('searchExercises', {
      movement_pattern: 'squat',
      equipment: 'barbell',
    }) as Array<Record<string, unknown>>;
    for (const ex of results) {
      expect(ex.movement_patterns).toContain('squat');
      expect(ex.equipment).toContain('barbell');
    }
  });
});

describe('checkVolumeCompliance', () => {
  it('returns compliant for volume within range', () => {
    const result = executor('checkVolumeCompliance', {
      muscle_group: 'quadriceps',
      weekly_sets: 10,
      fitness_level: 'intermediate',
    }) as Record<string, unknown>;
    expect(result.compliant).toBe(true);
    expect(result.min_sets).toBeDefined();
    expect(result.max_sets).toBeDefined();
  });

  it('returns non-compliant for volume below minimum', () => {
    const result = executor('checkVolumeCompliance', {
      muscle_group: 'chest',
      weekly_sets: 2,
      fitness_level: 'intermediate',
    }) as Record<string, unknown>;
    expect(result.compliant).toBe(false);
    expect((result.recommendation as string)).toContain('too low');
  });

  it('returns non-compliant for volume above maximum', () => {
    const result = executor('checkVolumeCompliance', {
      muscle_group: 'chest',
      weekly_sets: 30,
      fitness_level: 'beginner',
    }) as Record<string, unknown>;
    expect(result.compliant).toBe(false);
    expect((result.recommendation as string)).toContain('too high');
  });

  it('includes citations in response', () => {
    const result = executor('checkVolumeCompliance', {
      muscle_group: 'quadriceps',
      weekly_sets: 10,
      fitness_level: 'beginner',
    }) as Record<string, unknown>;
    expect(result.citations).toBeDefined();
    expect((result.citations as string[]).length).toBeGreaterThan(0);
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

describe('getEvidenceRule', () => {
  it('returns volume_fill_rates with citations', () => {
    const result = executor('getEvidenceRule', { rule_key: 'volume_fill_rates' }) as Record<string, unknown>;
    expect(result.rule_key).toBe('volume_fill_rates');
    expect(result.value).toBeDefined();
    expect((result.value as Record<string, number>).beginner).toBe(0.75);
    expect(result.citations).toBeDefined();
  });

  it('returns hiit_cycling with citations', () => {
    const result = executor('getEvidenceRule', { rule_key: 'hiit_cycling' }) as Record<string, unknown>;
    expect(result.rule_key).toBe('hiit_cycling');
    expect(result.value).toBeDefined();
    expect(result.citations).toBeDefined();
  });

  it('returns finisher_duration with citations', () => {
    const result = executor('getEvidenceRule', { rule_key: 'finisher_duration' }) as Record<string, unknown>;
    expect(result.rule_key).toBe('finisher_duration');
    expect((result.value as Record<string, number>).min_minutes).toBe(8);
    expect((result.value as Record<string, number>).max_minutes).toBe(15);
  });

  it('returns error for unknown rule key', () => {
    const result = executor('getEvidenceRule', { rule_key: 'nonexistent_rule' }) as Record<string, unknown>;
    expect(result.error).toBeDefined();
    expect((result.error as string)).toContain('Unknown evidence rule');
  });

  it('returns all available evidence rules', () => {
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
      const result = executor('getEvidenceRule', { rule_key: key }) as Record<string, unknown>;
      expect(result.error).toBeUndefined();
      expect(result.value).toBeDefined();
      expect(result.citations).toBeDefined();
    }
  });
});

describe('unknown tool', () => {
  it('returns error for unknown tool name', () => {
    const result = executor('unknownTool', {}) as Record<string, unknown>;
    expect(result.error).toBeDefined();
    expect((result.error as string)).toContain('Unknown tool');
  });
});
