import { describe, expect, it } from 'vitest';
import { collectRationaleCodes } from '../../src/validation/evidence-citation-validator.js';

describe('collectRationaleCodes', () => {
  it('collects bare rationale_codes string arrays', () => {
    const codes = new Set<string>();
    collectRationaleCodes(
      { exercise: { rationale_codes: ['SCHOENFELD_2017_DOSE_RESPONSE'] } },
      codes,
    );
    expect(codes.has('SCHOENFELD_2017_DOSE_RESPONSE')).toBe(true);
  });

  it('collects the code field from StrategyDecisionSchema-shaped rationale entries', () => {
    const codes = new Set<string>();
    collectRationaleCodes(
      {
        strategy: {
          rationale: [
            {
              code: 'SPLIT_TYPE_DECISION',
              selected_value: 'upper_lower',
              reason: 'Frequency is a volume-distribution tool.',
              source_fields: ['available_days_per_week'],
              confidence: 'high',
            },
            {
              code: 'SCHOENFELD_2016_FREQUENCY',
              selected_value: 'upper_lower',
              reason: '2x/week per muscle group.',
              source_fields: [],
              confidence: 'high',
            },
          ],
        },
      },
      codes,
    );
    expect(codes.has('SPLIT_TYPE_DECISION')).toBe(true);
    expect(codes.has('SCHOENFELD_2016_FREQUENCY')).toBe(true);
  });

  it('does not choke on plain-string rationale arrays (progression_policy shape)', () => {
    const codes = new Set<string>();
    expect(() =>
      collectRationaleCodes(
        { progression_policy: { rationale: ['Standard double progression.'] } },
        codes,
      ),
    ).not.toThrow();
  });

  it('collects internal-tag code fields too (harmless — filtered downstream by CITATION_SHAPE)', () => {
    const codes = new Set<string>();
    collectRationaleCodes(
      { health_flags: [{ code: 'GOAL_MISMATCH_BODY_COMP', severity: 'warning' }] },
      codes,
    );
    expect(codes.has('GOAL_MISMATCH_BODY_COMP')).toBe(true);
  });
});
