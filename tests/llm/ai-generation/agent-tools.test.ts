import { describe, expect, it } from 'vitest';
import { AGENT_TOOLS, SEARCH_EXERCISES_TOOL, CHECK_VOLUME_COMPLIANCE_TOOL, GET_EVIDENCE_RULE_TOOL } from '../../../src/llm/ai-generation/agent-tools.js';

describe('AGENT_TOOLS', () => {
  it('defines exactly 3 tools', () => {
    expect(AGENT_TOOLS).toHaveLength(3);
  });

  it('all tools have type function', () => {
    for (const tool of AGENT_TOOLS) {
      expect(tool.type).toBe('function');
    }
  });

  it('all tools have a name, description, and parameters', () => {
    for (const tool of AGENT_TOOLS) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.parameters).toBeDefined();
      expect((tool.parameters as Record<string, unknown>).type).toBe('object');
    }
  });

  it('searchExercises has optional filter parameters', () => {
    const params = SEARCH_EXERCISES_TOOL.parameters as Record<string, unknown>;
    const props = params.properties as Record<string, unknown>;
    expect(props.movement_pattern).toBeDefined();
    expect(props.muscle_group).toBeDefined();
    expect(props.equipment).toBeDefined();
    expect(props.difficulty).toBeDefined();
    expect(props.limit).toBeDefined();
    expect(params.required).toEqual([]);
  });

  it('checkVolumeCompliance requires muscle_group, weekly_sets, and fitness_level', () => {
    const params = CHECK_VOLUME_COMPLIANCE_TOOL.parameters as Record<string, unknown>;
    expect(params.required).toEqual(['muscle_group', 'weekly_sets', 'fitness_level']);
  });

  it('getEvidenceRule requires rule_key with valid enum values', () => {
    const params = GET_EVIDENCE_RULE_TOOL.parameters as Record<string, unknown>;
    expect(params.required).toEqual(['rule_key']);
    const props = params.properties as Record<string, { enum?: string[] }>;
    expect(props.rule_key?.enum).toContain('volume_fill_rates');
    expect(props.rule_key?.enum).toContain('hiit_cycling');
    expect(props.rule_key?.enum).toContain('beginner_hiit_exclusion');
  });
});
