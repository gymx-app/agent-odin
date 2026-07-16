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

  it('collects citation codes from ConditioningPrescription.rationale (plain string[], key name "rationale" not "rationale_codes")', () => {
    // This was the actual gap behind the citation-misapplication bug: this
    // field was invisible to the collector, so narrative synthesis never
    // had it in its real, athlete-specific citation pool and fell back to
    // ALL_CITATION_CODES (the whole registry) instead — which is what let a
    // hypertrophy-only citation get attached to an unrelated fat-loss claim.
    const codes = new Set<string>();
    collectRationaleCodes(
      {
        conditioning: [
          {
            conditioning_id: 'day1-conditioning',
            rationale: [
              'RESISTANCE_PRIORITY_ORDER_APPLIED',
              'MURLASITS_2018_CONCURRENT',
              'WILSON_2012_CONCURRENT_TRAINING',
              'SCHUMANN_2022_CONCURRENT_UPDATE',
            ],
          },
        ],
      },
      codes,
    );
    expect(codes.has('MURLASITS_2018_CONCURRENT')).toBe(true);
    expect(codes.has('WILSON_2012_CONCURRENT_TRAINING')).toBe(true);
    expect(codes.has('SCHUMANN_2022_CONCURRENT_UPDATE')).toBe(true);
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
