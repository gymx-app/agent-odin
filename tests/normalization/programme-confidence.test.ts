import { describe, expect, it } from 'vitest';
import { calculateProgrammeConfidence } from '../../src/normalization/programme-confidence.js';
import { calculateWeightChange } from '../../src/normalization/weight-change.js';
import { createBaseAssumptions } from '../../src/normalization/assumptions.js';
import { completeInBody, createAthlete } from './test-athletes.js';

describe('calculateProgrammeConfidence', () => {
  it('returns medium for complete ordinary input without InBody', () => {
    const athlete = createAthlete();

    expect(
      calculateProgrammeConfidence(
        athlete,
        calculateWeightChange(athlete),
        [],
        createBaseAssumptions(athlete),
      ),
    ).toBe('medium');
  });

  it('forces low when a blocking flag is present', () => {
    const athlete = createAthlete();

    expect(
      calculateProgrammeConfidence(
        athlete,
        calculateWeightChange(athlete),
        [
          {
            code: 'IMPLAUSIBLE_BODY_FAT',
            severity: 'blocking',
            message: 'Bad data.',
          },
        ],
        [],
      ),
    ).toBe('low');
  });

  it('does not return high for incomplete input', () => {
    const athlete = createAthlete({
      injuries: [
        {
          area: 'pain',
          severity: 'modify',
          notes: '',
        },
      ],
    });

    expect(
      calculateProgrammeConfidence(
        athlete,
        calculateWeightChange(athlete),
        [
          {
            code: 'UNKNOWN_INJURY_AREA',
            severity: 'warning',
            message: 'Unknown.',
          },
        ],
        createBaseAssumptions(athlete),
      ),
    ).not.toBe('high');
  });

  it('allows InBody and specific injury details to improve confidence without guaranteeing high', () => {
    const athlete = createAthlete({
      inbody: completeInBody,
      injuries: [
        {
          area: 'knee',
          severity: 'modify',
          notes: 'Deep flexion bothers it.',
        },
      ],
    });

    expect(
      calculateProgrammeConfidence(
        athlete,
        calculateWeightChange(athlete),
        [],
        createBaseAssumptions(athlete),
      ),
    ).toBe('medium');
  });
});
