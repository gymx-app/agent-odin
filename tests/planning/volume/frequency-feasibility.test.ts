import { describe, expect, it } from 'vitest';
import { normalizeAthlete } from '../../../src/normalization/athlete-normalizer.js';
import { selectFeasibleResistanceFrequency } from '../../../src/planning/volume/frequency-feasibility.js';
import { createAthlete } from '../../normalization/test-athletes.js';

describe('selectFeasibleResistanceFrequency', () => {
  it('returns the candidate frequency unchanged when it already meets the max', () => {
    const profile = normalizeAthlete(createAthlete());
    expect(selectFeasibleResistanceFrequency(profile, 4, 4)).toBe(4);
  });

  it('bumps frequency toward the max when capacity cannot fit minimum effective volume', () => {
    const profile = normalizeAthlete(
      createAthlete({
        fitness_level: 'advanced',
        session_duration_min: 30,
      }),
    );
    // A 30-min session (max ~4 sets) can't fit an advanced athlete's
    // minimum-effective volume across every muscle group at only 3
    // resistance days/week, so this should climb toward the ceiling.
    const result = selectFeasibleResistanceFrequency(profile, 3, 6);
    expect(result).toBeGreaterThan(3);
    expect(result).toBeLessThanOrEqual(6);
  });

  it('never exceeds the provided max, even if volume is still short', () => {
    const profile = normalizeAthlete(
      createAthlete({
        fitness_level: 'advanced',
        session_duration_min: 20,
      }),
    );
    const result = selectFeasibleResistanceFrequency(profile, 2, 3);
    expect(result).toBeLessThanOrEqual(3);
  });

  it('does not bump a beginner with ample per-session capacity', () => {
    const profile = normalizeAthlete(
      createAthlete({
        fitness_level: 'beginner',
        session_duration_min: 90,
      }),
    );
    expect(selectFeasibleResistanceFrequency(profile, 3, 6)).toBe(3);
  });

  it('is deterministic', () => {
    const profile = normalizeAthlete(
      createAthlete({ fitness_level: 'advanced', session_duration_min: 30 }),
    );
    expect(selectFeasibleResistanceFrequency(profile, 3, 6)).toBe(
      selectFeasibleResistanceFrequency(profile, 3, 6),
    );
  });
});
