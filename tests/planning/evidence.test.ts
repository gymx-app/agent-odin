import { describe, expect, it } from 'vitest';
import {
  ALL_CITATION_CODES,
  CITATION_REGISTRY,
  percentOneRepMaxForRpeReps,
} from '../../src/planning/evidence.js';

describe('percentOneRepMaxForRpeReps', () => {
  it('returns the table value for an exact RPE/rep match', () => {
    expect(percentOneRepMaxForRpeReps(8, 5)).toBe(81.1);
    expect(percentOneRepMaxForRpeReps(10, 1)).toBe(100);
  });

  it('rounds target_rpe to the nearest 0.5 before lookup', () => {
    expect(percentOneRepMaxForRpeReps(8.2, 5)).toBe(
      percentOneRepMaxForRpeReps(8, 5),
    );
    expect(percentOneRepMaxForRpeReps(8.3, 5)).toBe(
      percentOneRepMaxForRpeReps(8.5, 5),
    );
  });

  it('decreases as reps increase at a fixed RPE', () => {
    const values = [1, 3, 6, 9, 12].map(
      (reps) => percentOneRepMaxForRpeReps(8, reps)!,
    );
    values.slice(1).forEach((value, index) => {
      expect(value).toBeLessThan(values[index]!);
    });
  });

  it('increases as RPE increases at a fixed rep target', () => {
    const values = [6, 7, 8, 9, 10].map(
      (rpe) => percentOneRepMaxForRpeReps(rpe, 5)!,
    );
    values.slice(1).forEach((value, index) => {
      expect(value).toBeGreaterThan(values[index]!);
    });
  });

  it('returns undefined outside the published table range', () => {
    expect(percentOneRepMaxForRpeReps(5, 5)).toBeUndefined();
    expect(percentOneRepMaxForRpeReps(8, 13)).toBeUndefined();
    expect(percentOneRepMaxForRpeReps(8, 0)).toBeUndefined();
  });
});

describe('set-structure citations', () => {
  it('registers all four set-structure citation codes', () => {
    [
      'IVERSEN_2021_TIME_EFFICIENT_TRAINING',
      'DROP_SET_HYPERTROPHY_EQUIVALENCE',
      'TUFANO_2016_CLUSTER_VELOCITY',
      'CLUSTER_HYPERTROPHY_EQUIVALENCE_SINGLE_STUDY',
    ].forEach((code) => {
      expect(ALL_CITATION_CODES.has(code)).toBe(true);
      expect(CITATION_REGISTRY[code]).toBeDefined();
    });
  });

  it('keeps cluster sets\' velocity claim and hypertrophy claim as distinct, differently-tiered codes', () => {
    const velocity = CITATION_REGISTRY.TUFANO_2016_CLUSTER_VELOCITY!;
    const hypertrophy =
      CITATION_REGISTRY.CLUSTER_HYPERTROPHY_EQUIVALENCE_SINGLE_STUDY!;
    expect(velocity.tier).toBe('meta_analysis');
    expect(hypertrophy.tier).not.toBe(velocity.tier);
    expect(velocity.finding).not.toBe(hypertrophy.finding);
  });
});

describe('split-frequency citations', () => {
  it('registers both frequency citation codes as meta-analyses', () => {
    ['SCHOENFELD_2016_FREQUENCY', 'SCHOENFELD_2019_FREQUENCY_VOLUME_EQUATED'].forEach(
      (code) => {
        expect(ALL_CITATION_CODES.has(code)).toBe(true);
        expect(CITATION_REGISTRY[code]?.tier).toBe('meta_analysis');
      },
    );
  });

  it('keeps the 2016 finding and its 2019 correction as distinct findings', () => {
    const original = CITATION_REGISTRY.SCHOENFELD_2016_FREQUENCY!;
    const correction = CITATION_REGISTRY.SCHOENFELD_2019_FREQUENCY_VOLUME_EQUATED!;
    expect(original.finding).not.toBe(correction.finding);
    expect(correction.finding).toMatch(/equated/i);
  });
});

describe('RIR/proximity-to-failure citations', () => {
  it('registers all four citation codes', () => {
    [
      'REFALO_2022_FAILURE_EFFECT',
      'GRGIC_2022_FAILURE_EFFECT',
      'ZOURDOS_2016_RIR_VELOCITY_VALIDATION',
      'ZOURDOS_2019_BASTOS_2024_RIR_ACCURACY_DEGRADATION',
    ].forEach((code) => {
      expect(ALL_CITATION_CODES.has(code)).toBe(true);
      expect(CITATION_REGISTRY[code]).toBeDefined();
    });
  });

  it('keeps the failure-effect claim and the RIR-validity claim as separate, correctly-tiered codes', () => {
    const failure = CITATION_REGISTRY.REFALO_2022_FAILURE_EFFECT!;
    const velocity = CITATION_REGISTRY.ZOURDOS_2016_RIR_VELOCITY_VALIDATION!;
    const degradation =
      CITATION_REGISTRY.ZOURDOS_2019_BASTOS_2024_RIR_ACCURACY_DEGRADATION!;
    expect(failure.tier).toBe('meta_analysis');
    expect(velocity.tier).toBe('direct_validation');
    expect(degradation.tier).toBe('few_studies');
    expect(failure.finding).not.toBe(velocity.finding);
    expect(velocity.finding).not.toBe(degradation.finding);
  });
});

describe('concurrent-training interference citations', () => {
  it('registers the Wilson 2012 / Schumann 2022 pair and the renamed Sabag 2018 code', () => {
    [
      'WILSON_2012_CONCURRENT_TRAINING',
      'SCHUMANN_2022_CONCURRENT_UPDATE',
      'SABAG_2018_CONCURRENT_HIIT',
    ].forEach((code) => {
      expect(ALL_CITATION_CODES.has(code)).toBe(true);
      expect(CITATION_REGISTRY[code]).toBeDefined();
    });
    // The old, wrongly-labeled key must not linger alongside the fix.
    expect(ALL_CITATION_CODES.has('SABAG_2022_CONCURRENT_HIIT')).toBe(false);
  });

  it('gives Wilson 2012 and its Schumann 2022 correction matching meta-analysis tiers, as a pair', () => {
    const original = CITATION_REGISTRY.WILSON_2012_CONCURRENT_TRAINING!;
    const correction = CITATION_REGISTRY.SCHUMANN_2022_CONCURRENT_UPDATE!;
    expect(original.tier).toBe('meta_analysis');
    expect(correction.tier).toBe('meta_analysis');
    expect(original.finding).not.toBe(correction.finding);
    expect(correction.finding).toMatch(/not meaningfully compromised/i);
  });
});
