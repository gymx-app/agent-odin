import { describe, expect, it } from 'vitest';
import { classifySportInterference } from '../../src/normalization/sport-interference-classifier.js';
import { createAthlete } from './test-athletes.js';

describe('classifySportInterference', () => {
  it('returns none when no sport is reported', () => {
    expect(classifySportInterference(createAthlete()).value).toBe('none');
  });

  it('returns low for a complete low-load sport', () => {
    expect(
      classifySportInterference(
        createAthlete({
          sport: {
            sessions_per_week: 1,
            typical_duration_min: 45,
            intensity: 'low',
            priority: 'supporting',
            lower_body_load: 'low',
            upper_body_load: 'low',
            impact_level: 'low',
            sprint_exposure: false,
          },
        }),
      ).value,
    ).toBe('low');
  });

  it('returns high for high-impact football twice weekly', () => {
    expect(
      classifySportInterference(
        createAthlete({
          sport: {
            name: 'Football',
            sessions_per_week: 2,
            typical_duration_min: 90,
            intensity: 'high',
            priority: 'primary',
            lower_body_load: 'high',
            upper_body_load: 'moderate',
            impact_level: 'high',
            sprint_exposure: true,
          },
        }),
      ).value,
    ).toBe('high');
  });

  it('returns unknown for incomplete sport information', () => {
    expect(
      classifySportInterference(
        createAthlete({
          sport: { name: 'Football', sessions_per_week: 2 },
        }),
      ),
    ).toMatchObject({
      value: 'unknown',
      confidence: 'low',
    });
  });
});
