import { describe, expect, it } from 'vitest';
import { compareProgrammeValidation } from '../../src/llm/refinement-policy.js';
import { refinementFixture } from './test-refinement.js';

describe('compareProgrammeValidation', () => {
  it('accepts equal and small noncritical score changes', () => {
    const { validation } = refinementFixture();

    expect(compareProgrammeValidation(validation, validation).accepted).toBe(
      true,
    );
    expect(
      compareProgrammeValidation(validation, {
        ...validation,
        overall_score: Math.max(0, validation.overall_score - 2),
        scores: {
          ...validation.scores,
          goal_specificity: Math.max(0, validation.scores.goal_specificity - 5),
        },
      }).accepted,
    ).toBe(true);
  });

  it('rejects new errors, hard-category declines and excessive score decline', () => {
    const { validation } = refinementFixture();

    expect(
      compareProgrammeValidation(validation, {
        ...validation,
        passed: false,
        status: 'fail',
        summary: { ...validation.summary, error_count: 1 },
      }).accepted,
    ).toBe(false);
    expect(
      compareProgrammeValidation(validation, {
        ...validation,
        scores: {
          ...validation.scores,
          constraint_fit: validation.scores.constraint_fit - 1,
        },
      }).accepted,
    ).toBe(false);
    expect(
      compareProgrammeValidation(validation, {
        ...validation,
        overall_score: Math.max(0, validation.overall_score - 3),
      }).accepted,
    ).toBe(false);
  });
});
