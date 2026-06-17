import { describe, expect, it } from 'vitest';
import { estimateRecoveryCapacity } from '../../src/normalization/recovery-capacity.js';
import { completeInBody, createAthlete } from './test-athletes.js';

describe('estimateRecoveryCapacity', () => {
  it('returns a conservative beginner estimate', () => {
    expect(estimateRecoveryCapacity(createAthlete(), 135, [])).toBe('moderate');
  });

  it('returns a moderate intermediate estimate', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          fitness_level: 'intermediate',
          available_days_per_week: 4,
        }),
        240,
        [],
      ),
    ).toBe('moderate');
  });

  it('does not automatically give advanced users high recovery', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          fitness_level: 'advanced',
          available_days_per_week: 5,
          inbody: completeInBody,
        }),
        450,
        [],
      ),
    ).toBe('moderate');
  });

  it('reduces estimate when multiple injuries are present', () => {
    expect(
      estimateRecoveryCapacity(
        createAthlete({
          injuries: [
            {
              area: 'knee',
              severity: 'modify',
              notes: 'Sensitive.',
            },
            {
              area: 'shoulder',
              severity: 'modify',
              notes: 'Sensitive.',
            },
          ],
        }),
        135,
        [],
      ),
    ).toBe('low');
  });
});
