import { describe, expect, it } from 'vitest';
import type { LongitudinalOdinProgramme } from '../../src/domain/programme/programme.types.js';
import {
  applyWeightPrescription,
  calculateWorkingWeight,
  estimateOneRepMax,
} from '../../src/planning/weight-prescription.js';

type Phases = LongitudinalOdinProgramme['phases'];

const buildExercise = (
  exercise_id: string,
  overrides: Partial<{ target_rpe: number; target_reps: number; set_type: 'working' | 'calibration' | 'backoff' }> = {},
) => ({
  prescription_id: `p-${exercise_id}`,
  exercise_id,
  exercise_name: exercise_id,
  display_order: 1,
  sequence_role: 'primary' as const,
  priority: 1,
  weight_kg: null,
  tags: [],
  coaching_cues: [],
  warnings: [],
  sets: [
    {
      set_number: 1,
      set_type: overrides.set_type ?? ('working' as const),
      target_reps: overrides.target_reps ?? 5,
      target_rpe: overrides.target_rpe ?? 8,
      rpe_ceiling: 9,
      rest_seconds: 180,
    },
  ],
  progression_bounds: {
    rep_min: 3,
    rep_max: 6,
    load_increment_type: 'smallest_available' as const,
  },
  progression_rule_id: 'default-progression',
  user_progression_rule: 'Progress within the RPE ceiling.',
  equipment: ['barbell'],
  movement_patterns: ['squat'],
  primary_muscles: ['quadriceps'],
  secondary_muscles: ['glutes'],
  sequencing_rationale: [],
});

const buildPhases = (exercises: ReturnType<typeof buildExercise>[]): Phases =>
  [
    {
      phase_id: 'p1',
      phase_number: 1,
      name: 'Foundation',
      phase_type: 'foundation',
      objective: 'general',
      start_week: 1,
      end_week: 1,
      weeks_count: 1,
      volume_direction: 'maintain',
      intensity_direction: 'maintain',
      effort_direction: 'maintain',
      progression_model: 'simple_progressive',
      rationale: [],
      weeks: [
        {
          week_number: 1,
          week_type: 'loading',
          planned_volume_factor: 1,
          planned_intensity_factor: 1,
          planned_effort_factor: 1,
          days: [
            {
              day_id: 'd1',
              cycle_day: 1,
              day_type: 'resistance',
              title: 'Day 1',
              estimated_duration_min: 60,
              maximum_duration_min: 90,
              fatigue_classification: 'moderate',
              movement_emphasis: [],
              warmup: [],
              exercises,
              conditioning: [],
              cooldown: [],
            },
          ],
          progression_notes: [],
          review_triggers: [],
          planning_metadata: {} as never,
        },
      ],
    },
  ] as unknown as Phases;

describe('estimateOneRepMax', () => {
  it('applies the Epley formula', () => {
    expect(estimateOneRepMax(100, 5)).toBeCloseTo(100 * (1 + 5 / 30), 5);
  });

  it('rejects reps outside 1-12', () => {
    expect(() => estimateOneRepMax(100, 15)).toThrow();
  });
});

describe('calculateWorkingWeight', () => {
  it('rounds to the nearest 2.5kg plate increment', () => {
    const result = calculateWorkingWeight(101, 'strength');
    expect(result % 2.5).toBe(0);
  });
});

const baseAthlete = {
  goal: 'strength',
  sex: 'male' as const,
  age: 30,
  bodyweight_kg: 80,
  training_status: 'intermediate' as const,
};

describe('applyWeightPrescription', () => {
  it('falls back to a bodyweight-ratio estimate (low confidence) when baseline_path is not self_reported, instead of leaving weight_kg null', () => {
    // odin-programme-design-logic.md, Section 4: "not just an RPE-anchored
    // fallback when 1RM is missing" — estimateBaselineStrength always
    // produces a number, honestly tiered.
    const phases = buildPhases([buildExercise('barbell_back_squat')]);
    const result = applyWeightPrescription(phases, {
      ...baseAthlete,
      baseline_path: 'skipped',
      known_lifts: null,
    });
    const exercise = result[0]!.weeks[0]!.days[0]!.exercises[0]!;
    expect(exercise.weight_kg).not.toBeNull();
    expect(exercise.weight_confidence).toBe('low');
  });

  it('leaves weight_kg null for exercises with no mapped movement pattern (no barbell lift for it in the library)', () => {
    const phases = buildPhases([buildExercise('dumbbell_goblet_squat')]);
    const result = applyWeightPrescription(phases, {
      ...baseAthlete,
      baseline_path: 'self_reported',
      known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
    });
    const exercise = result[0]!.weeks[0]!.days[0]!.exercises[0]!;
    expect(exercise.weight_kg).toBeNull();
    expect(exercise.weight_confidence).toBeUndefined();
  });

  it('prefers the self-reported known lift (high confidence) over the ratio-default estimate', () => {
    const phases = buildPhases([buildExercise('barbell_back_squat')]);
    const result = applyWeightPrescription(phases, {
      ...baseAthlete,
      baseline_path: 'self_reported',
      known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
    });
    const exercise = result[0]!.weeks[0]!.days[0]!.exercises[0]!;
    expect(exercise.weight_confidence).toBe('high');
  });

  it('computes weight from the RPE/reps table for a matching working set', () => {
    const phases = buildPhases([
      buildExercise('barbell_back_squat', { target_rpe: 8, target_reps: 5 }),
    ]);
    const result = applyWeightPrescription(phases, {
      ...baseAthlete,
      baseline_path: 'self_reported',
      known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
    });
    const weight = result[0]!.weeks[0]!.days[0]!.exercises[0]!.weight_kg;
    const estimated1rm = 100 * (1 + 5 / 30);
    // RPE 8, 5 reps -> 81.1% of 1RM (RPE_PERCENT_1RM_TABLE)
    expect(weight).toBeCloseTo(
      Math.round((estimated1rm * 0.811) / 2.5) * 2.5,
      5,
    );
  });

  it('produces heavier load for a higher-RPE set at the same rep target', () => {
    const lighter = applyWeightPrescription(
      buildPhases([
        buildExercise('barbell_back_squat', { target_rpe: 6, target_reps: 5 }),
      ]),
      {
        ...baseAthlete,
        baseline_path: 'self_reported',
        known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
      },
    )[0]!.weeks[0]!.days[0]!.exercises[0]!.weight_kg!;

    const heavier = applyWeightPrescription(
      buildPhases([
        buildExercise('barbell_back_squat', { target_rpe: 9.5, target_reps: 5 }),
      ]),
      {
        ...baseAthlete,
        baseline_path: 'self_reported',
        known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
      },
    )[0]!.weeks[0]!.days[0]!.exercises[0]!.weight_kg!;

    expect(heavier).toBeGreaterThan(lighter);
  });

  it('falls back to the goal-based percentage outside the table range', () => {
    const phases = buildPhases([
      buildExercise('barbell_back_squat', { target_rpe: 3, target_reps: 5 }),
    ]);
    const result = applyWeightPrescription(phases, {
      ...baseAthlete,
      baseline_path: 'self_reported',
      known_lifts: [{ exercise_id: 'squat', weight_kg: 100, reps: 5 }],
    });
    const weight = result[0]!.weeks[0]!.days[0]!.exercises[0]!.weight_kg;
    const estimated1rm = 100 * (1 + 5 / 30);
    expect(weight).toBeCloseTo(Math.round((estimated1rm * 0.825) / 2.5) * 2.5, 5);
  });

  it('is deterministic', () => {
    const phases = buildPhases([
      buildExercise('barbell_back_squat', { target_rpe: 8, target_reps: 5 }),
    ]);
    const athlete = {
      ...baseAthlete,
      baseline_path: 'self_reported' as const,
      known_lifts: [{ exercise_id: 'squat' as const, weight_kg: 100, reps: 5 }],
    };
    expect(applyWeightPrescription(phases, athlete)).toEqual(
      applyWeightPrescription(phases, athlete),
    );
  });
});
