import { DAYS_OF_WEEK } from '../shared/domain-enums.js';
import {
  LegacyOdinProgrammeSchema,
  LongitudinalOdinProgrammeSchema,
  VersionedLegacyOdinProgrammeSchema,
} from './programme.schema.js';
import type {
  LegacyOdinProgramme,
  LongitudinalOdinProgramme,
  VersionedLegacyOdinProgramme,
  VersionedOdinProgramme,
} from './programme.types.js';

const COMPATIBILITY_NOTICE =
  'Compatibility projection from schema 2.0: only the first representative cycle of each phase is retained; explicit later weeks and cycle days beyond seven are not represented as equivalent weeks.';

export type LegacyProjectionOptions = {
  available_days: number;
  equipment: LegacyOdinProgramme['programme']['equipment'];
};

export const isLegacyProgramme = (
  programme: unknown,
): programme is LegacyOdinProgramme | VersionedLegacyOdinProgramme =>
  LegacyOdinProgrammeSchema.safeParse(programme).success ||
  VersionedLegacyOdinProgrammeSchema.safeParse(programme).success;

export const isLongitudinalProgramme = (
  programme: unknown,
): programme is LongitudinalOdinProgramme =>
  LongitudinalOdinProgrammeSchema.safeParse(programme).success;

export const toLegacyProgramme = (
  programme: LongitudinalOdinProgramme,
  options: LegacyProjectionOptions,
): LegacyOdinProgramme => {
  const projected = {
    programme: {
      name: programme.programme.name,
      goal_type: programme.programme.goal_type,
      goal_description: programme.programme.goal_description,
      start_weight_kg: programme.programme.start_weight_kg,
      target_weight_kg: programme.programme.target_weight_kg,
      target_weeks: programme.programme.target_weeks,
      available_days: options.available_days,
      equipment: options.equipment,
      started_at: programme.programme.start_date,
    },
    config: {
      start_date: programme.programme.start_date,
      phase_weeks: programme.phases.map((phase) => phase.weeks_count),
      min_active_days: 0,
      total_phases: programme.phases.length,
    },
    phases: programme.phases.map((phase) => ({
      phase_number: phase.phase_number,
      name: phase.name,
      goal: phase.objective,
      weeks_count: phase.weeks_count,
      intensity_level: 5,
      volume_level: 5,
      progression_intent:
        phase.phase_type === 'realization'
          ? ('realisation' as const)
          : phase.phase_type === 'recovery'
            ? ('deload' as const)
            : phase.phase_type === 'maintenance'
              ? ('maintenance' as const)
              : phase.phase_type === 'foundation'
                ? ('accumulation' as const)
                : phase.phase_type,
    })),
    phase_week_templates: programme.phases.map((phase) => {
      const representativeDays = phase.weeks[0]!.days.slice(0, 7);
      const days = DAYS_OF_WEEK.map((dayOfWeek, index) => {
        const day = representativeDays[index];
        if (!day) {
          return {
            day_of_week: dayOfWeek,
            workout_type: 'rest' as const,
            title: 'Rest',
            subtitle: 'Compatibility projection',
            duration_min: null,
            tags: ['compatibility_projection'],
            has_warmup: false,
            liss_content: null,
            cooldown_items: [],
            exercises: [],
          };
        }
        const resistance = day.exercises.length > 0;
        const conditioning = day.conditioning[0];
        const workoutType = resistance
          ? ('workout' as const)
          : conditioning
            ? ('liss' as const)
            : ('rest' as const);
        return {
          day_of_week: dayOfWeek,
          workout_type: workoutType,
          title: day.title,
          subtitle: day.subtitle ?? '',
          duration_min:
            workoutType === 'rest' ? null : day.estimated_duration_min,
          tags: [day.day_type, 'compatibility_projection'],
          has_warmup: resistance && day.warmup.length > 0,
          liss_content: conditioning
            ? `${conditioning.duration_min} minutes ${conditioning.activity_name}: ${conditioning.intensity.target_label ?? conditioning.intensity.method}.`
            : null,
          cooldown_items: day.cooldown.map((item) => ({
            item_key: item.cooldown_id,
            label: item.activity_name,
            detail: item.purpose,
            display_order: item.display_order,
          })),
          exercises: day.exercises.map((exercise) => ({
            display_order: exercise.display_order,
            exercise_id: exercise.exercise_id,
            exercise_name: exercise.exercise_name,
            tags: exercise.tags,
            coaching_cues: exercise.coaching_cues,
            warnings: exercise.warnings,
            sets: exercise.sets,
            progression_bounds: {
              rep_min: exercise.progression_bounds.rep_min,
              rep_max: exercise.progression_bounds.rep_max,
            },
            progression_rule: programme.progression_policy.success_condition,
            equipment: exercise.equipment,
            movement_patterns: exercise.movement_patterns,
            primary_muscles: exercise.primary_muscles,
            secondary_muscles: exercise.secondary_muscles,
          })),
        };
      });
      return { phase_number: phase.phase_number, days };
    }),
    warmup_items:
      programme.phases[0]?.weeks[0]?.days
        .find((day) => day.warmup.length > 0)
        ?.warmup.map((item) => ({
          item_key: item.warmup_id,
          label: item.activity_name,
          detail: item.purpose,
          display_order: item.display_order,
        })) ?? [],
    assumptions: [
      ...programme.assumptions.map((assumption) => assumption.message),
      COMPATIBILITY_NOTICE,
    ],
    review_triggers: programme.review_triggers.map(
      (trigger) => trigger.message,
    ),
    validation_summary: {
      passed: programme.validation_summary.passed,
      scores: {
        constraint_fit:
          programme.validation_summary.category_scores.constraint_fit ?? 100,
        movement_balance:
          programme.validation_summary.category_scores.movement_balance ?? 100,
        recovery_fit:
          programme.validation_summary.category_scores.recovery_fit ?? 100,
        goal_specificity:
          programme.validation_summary.category_scores.goal_specificity ?? 100,
        progression_quality:
          programme.validation_summary.category_scores.progression_quality ??
          100,
        session_time_fit:
          programme.validation_summary.category_scores.session_time_fit ?? 100,
      },
      warnings: [
        ...programme.validation_summary.warnings,
        {
          code: 'V2_COMPATIBILITY_PROJECTION',
          severity: 'warning' as const,
          message: COMPATIBILITY_NOTICE,
        },
      ],
    },
  };

  return LegacyOdinProgrammeSchema.parse(projected);
};

export const programmeVersion = (
  programme: VersionedOdinProgramme,
): '1.0' | '2.0' => programme.schema_version;
