import { describe, expect, it } from 'vitest';
import { validLongitudinalProgramme } from '../../../fixtures/programmes/valid-longitudinal-programme.js';
import { LongitudinalOdinProgrammeSchema } from '../../../src/domain/programme/programme.schema.js';
import { planConditioning } from '../../../src/planning/conditioning/conditioning-planner.js';
import { planConditioningPlacement } from '../../../src/planning/conditioning/conditioning-placement-planner.js';
import { createProfile } from '../test-planning-utils.js';

const input = (
  profilePatch = {},
  strategyPatch: Partial<typeof validLongitudinalProgramme.strategy> = {},
) => ({
  profile: createProfile(profilePatch),
  strategy: {
    ...structuredClone(validLongitudinalProgramme.strategy),
    ...strategyPatch,
  },
  calendar: structuredClone(validLongitudinalProgramme.calendar),
  phases: structuredClone(validLongitudinalProgramme.phases),
});

describe('Conditioning Planner V2', () => {
  it('plans measurable low-impact, duration-first beginner conditioning', () => {
    const result = planConditioning(
      input({}, { conditioning_strategy: 'fat_loss_support' }),
    );
    const prescriptions = result.phases.flatMap((phase) =>
      phase.weeks.map(
        (week) =>
          week.days.find((day) => day.day_type === 'conditioning')!
            .conditioning[0]!,
      ),
    );

    expect(result.requirement).toBe('developmental');
    expect(result.conditioning_policy.progression_model).toBe('duration_first');
    expect(prescriptions[0]!.conditioning_type).toBe(
      'low_intensity_steady_state',
    );
    expect(prescriptions[0]!.intensity).toEqual({
      method: 'session_rpe',
      target_min: 3,
      target_max: 3,
    });
    expect(prescriptions.map((item) => item.duration_min)).toEqual([
      20, 25, 30, 11,
    ]);
    expect(prescriptions.every((item) => item.impact_level === 'low')).toBe(
      true,
    );
    const parsed = LongitudinalOdinProgrammeSchema.safeParse({
      ...validLongitudinalProgramme,
      phases: result.phases,
      conditioning_policy: result.conditioning_policy,
    });
    expect(parsed.success, parsed.success ? '' : parsed.error.message).toBe(
      true,
    );
    // odin-programme-design-logic.md, Section 2: every conditioning
    // prescription now carries the real concurrent-interference citations
    // plus an explicit tag disclosing the scoring rubric is a heuristic,
    // not a validated scale.
    expect(prescriptions[0]!.rationale).toEqual(
      expect.arrayContaining([
        'WILSON_2012_CONCURRENT_TRAINING',
        'SCHUMANN_2022_CONCURRENT_UPDATE',
        'INTERFERENCE_SCORE_THRESHOLD_HEURISTIC',
      ]),
    );
  });

  it('does not default a high-body-weight, low-impact athlete to running', () => {
    const result = planConditioning(
      input({
        current_weight_kg: 125,
        target_weight_kg: 115,
        movement_restrictions: [
          {
            region: 'lower_body',
            movement_demand: 'high_impact',
            tolerance: 'excluded',
          },
        ],
      }),
    );
    expect(
      result.phases.flatMap((phase) =>
        phase.weeks.flatMap((week) =>
          week.days.flatMap((day) =>
            day.conditioning.map((item) => item.activity_id),
          ),
        ),
      ),
    ).not.toContain('running');
  });

  it('uses exact interval structure for endurance-priority conditioning', () => {
    const result = planConditioning(
      input(
        { goal: 'endurance', fitness_level: 'intermediate' },
        {
          primary_objective: 'endurance',
          conditioning_strategy: 'aerobic_base',
        },
      ),
    );
    const prescription = result.phases[0]!.weeks[0]!.days.find(
      (day) => day.day_type === 'conditioning',
    )!.conditioning[0]!;

    expect(prescription.conditioning_type).toBe('intervals');
    expect(prescription.intervals).toEqual({
      work_seconds: 60,
      recovery_seconds: 120,
      interval_count: 6,
      work_intensity: {
        method: 'session_rpe',
        target_min: 8,
        target_max: 8,
      },
      recovery_intensity: {
        method: 'session_rpe',
        target_min: 2,
        target_max: 2,
      },
    });
  });

  it('uses low-impact sprint intervals only for a ready advanced athlete', () => {
    const result = planConditioning(
      input(
        {
          goal: 'endurance',
          fitness_level: 'advanced',
          training_history: {
            years_consistent_training: 8,
            consistency_last_12_weeks: 'high',
            exercise_competency: 'advanced',
          },
          lifestyle: {
            occupation_type: 'active',
            average_daily_steps: 12000,
            sleep_hours: 8,
            sleep_quality: 9,
            perceived_stress: 2,
            recovery_rating: 9,
          },
        },
        {
          primary_objective: 'endurance',
          conditioning_strategy: 'performance',
        },
      ),
    );
    const prescription = result.phases[0]!.weeks[0]!.days.find(
      (day) => day.day_type === 'conditioning',
    )!.conditioning[0]!;

    expect(prescription.conditioning_type).toBe('sprint_intervals');
    expect(['assault_bike', 'stationary_bike']).toContain(
      prescription.activity_id,
    );
    expect(prescription.intervals?.work_seconds).toBe(20);
    expect(prescription.intervals?.work_intensity.target_min).toBe(9);
  });

  it('accounts for sport without adding sprint intervals', () => {
    const context = input(
      {
        sport: {
          name: 'Football',
          sessions_per_week: 2,
          session_days: ['WED', 'SAT'],
          typical_duration_min: 75,
          intensity: 'high',
          priority: 'equal',
          lower_body_load: 'high',
          upper_body_load: 'low',
          impact_level: 'high',
          sprint_exposure: true,
        },
      },
      { conditioning_strategy: 'sport_support' },
    );
    [2, 5].forEach((index) => {
      context.calendar.days[index] = {
        ...context.calendar.days[index]!,
        planned_session_type: 'sport',
        session_kind: 'sport',
        session_label: 'Football',
      };
      context.phases.forEach((phase) =>
        phase.weeks.forEach((week) => {
          week.days[index] = {
            ...week.days[index]!,
            day_type: 'sport',
            title: 'Football',
            estimated_duration_min: 75,
            maximum_duration_min: 75,
            training_budget: undefined,
            exercises: [],
          };
        }),
      );
    });

    const result = planConditioning(context);
    expect(result.weekly_loads[0]!.sport_session_count).toBe(2);
    expect(result.weekly_loads[0]!.sprint_exposure_count).toBe(2);
    expect(
      result.phases.flatMap((phase) =>
        phase.weeks.flatMap((week) =>
          week.days.flatMap((day) =>
            day.conditioning.map((item) => item.conditioning_type),
          ),
        ),
      ),
    ).not.toContain('sprint_intervals');
    expect(result.rationale_codes).toContain('SPORT_LOAD_REPLACED_HIIT');
  });

  it('selects a restriction-compatible modality deterministically', () => {
    const context = input({
      movement_restrictions: [
        {
          region: 'knee',
          movement_demand: 'loaded_deep_knee_flexion',
          tolerance: 'excluded',
        },
      ],
    });
    const first = planConditioning(context);
    const second = planConditioning(context);
    const modalities = first.phases.flatMap((phase) =>
      phase.weeks.flatMap((week) =>
        week.days.flatMap((day) =>
          day.conditioning.map((item) => item.activity_id),
        ),
      ),
    );

    expect(modalities).not.toContain('stationary_bike');
    expect(modalities).not.toContain('rowing');
    expect(first).toEqual(second);
  });

  it('places resistance-priority same-session conditioning after lifting', () => {
    // odin-programme-design-logic.md, Section 2: the after_resistance
    // ordering carries both the real programme-level citation (Murlasits)
    // and an explicit heuristic tag for the acute same-session reasoning —
    // they must not collapse into one undifferentiated claim.
    expect(
      planConditioningPlacement({
        profile: createProfile(),
        dayType: 'combined',
        priority: 'resistance',
        weekNumber: 1,
        availableCombinedMinutes: 20,
      }),
    ).toEqual({
      placement: 'after_resistance',
      rationale_codes: [
        'RESISTANCE_PRIORITY_ORDER_APPLIED',
        'MURLASITS_2018_CONCURRENT',
        'CONDITIONING_AFTER_RESISTANCE_ACUTE_ORDERING_HEURISTIC',
      ],
    });
  });

  it('records non-universal separation when conditioning cannot fit', () => {
    expect(
      planConditioningPlacement({
        profile: createProfile(),
        dayType: 'combined',
        priority: 'resistance',
        weekNumber: 1,
        availableCombinedMinutes: 5,
      }),
    ).toEqual({
      placement: 'same_day_separate_session',
      same_day_separation: { category: '6_to_12_hours' },
      rationale_codes: ['CONDITIONING_MOVED_TO_SEPARATE_DAY'],
    });
  });
});
