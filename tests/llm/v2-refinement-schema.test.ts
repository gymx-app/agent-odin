import { describe, expect, it } from 'vitest';
import {
  V2RefinementProposalSchema,
  V2RefinementOperationSchema,
} from '../../src/llm/v2-refinement.schema.js';

describe('V2RefinementOperationSchema', () => {
  it('validates a replace_exercise operation', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-1',
      operation_type: 'replace_exercise',
      target_id: 'prescription-1',
      replacement_id: 'exercise-2',
      reason_code: 'EXERCISE_VARIETY',
      reason: 'Better variety.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown operation types', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-bad',
      operation_type: 'add_new_phase',
      target_id: 'something',
      reason_code: 'GOAL_SPECIFICITY',
      reason: 'Should fail.',
    });
    expect(result.success).toBe(false);
  });

  it('requires replacement_id for replace_exercise', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-missing',
      operation_type: 'replace_exercise',
      target_id: 'prescription-1',
      reason_code: 'EXERCISE_VARIETY',
      reason: 'Missing replacement.',
    });
    expect(result.success).toBe(false);
  });

  it('requires new_value for reduce_optional_sets', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-missing-val',
      operation_type: 'reduce_optional_sets',
      target_id: 'prescription-1',
      reason_code: 'SESSION_TIME_FIT',
      reason: 'Missing new value.',
    });
    expect(result.success).toBe(false);
  });

  it('validates remove_optional_exercise without extra fields', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-remove',
      operation_type: 'remove_optional_exercise',
      target_id: 'prescription-1',
      reason_code: 'SESSION_TIME_FIT',
      reason: 'Remove accessory.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects extra fields on strict schemas', () => {
    const result = V2RefinementOperationSchema.safeParse({
      operation_id: 'op-extra',
      operation_type: 'remove_optional_exercise',
      target_id: 'prescription-1',
      reason_code: 'SESSION_TIME_FIT',
      reason: 'Remove.',
      sneaky_field: 'should not be here',
    });
    expect(result.success).toBe(false);
  });
});

describe('V2RefinementProposalSchema', () => {
  it('validates a valid refine proposal', () => {
    const result = V2RefinementProposalSchema.safeParse({
      decision: 'refine',
      summary: 'Reduce conditioning duration.',
      confidence: 'high',
      operations: [
        {
          operation_id: 'op-1',
          operation_type: 'reduce_conditioning_duration',
          target_id: 'cond-1',
          new_value: 15,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Reduce time.',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects no_change with operations', () => {
    const result = V2RefinementProposalSchema.safeParse({
      decision: 'no_change',
      summary: 'No change.',
      confidence: 'high',
      operations: [
        {
          operation_id: 'op-1',
          operation_type: 'reduce_conditioning_duration',
          target_id: 'cond-1',
          new_value: 15,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Should not be here.',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects refine with no operations', () => {
    const result = V2RefinementProposalSchema.safeParse({
      decision: 'refine',
      summary: 'Should have operations.',
      confidence: 'high',
      operations: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate operation IDs', () => {
    const result = V2RefinementProposalSchema.safeParse({
      decision: 'refine',
      summary: 'Duplicate IDs.',
      confidence: 'high',
      operations: [
        {
          operation_id: 'op-same',
          operation_type: 'reduce_conditioning_duration',
          target_id: 'cond-1',
          new_value: 15,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'First.',
        },
        {
          operation_id: 'op-same',
          operation_type: 'reduce_conditioning_duration',
          target_id: 'cond-2',
          new_value: 10,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Duplicate ID.',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects proposal containing both valid and invalid operations', () => {
    const result = V2RefinementProposalSchema.safeParse({
      decision: 'refine',
      summary: 'Mixed.',
      confidence: 'high',
      operations: [
        {
          operation_id: 'op-good',
          operation_type: 'reduce_conditioning_duration',
          target_id: 'cond-1',
          new_value: 15,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Valid.',
        },
        {
          operation_id: 'op-bad',
          operation_type: 'invent_exercise',
          target_id: 'whatever',
          reason_code: 'GOAL_SPECIFICITY',
          reason: 'Invalid type.',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
