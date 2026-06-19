import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { refinementError } from './refinement-errors.js';

const MAX_CONTEXT_CHARACTERS = 90000;

const ageBand = (age: number): string => {
  if (age < 18) return 'under_18';
  if (age < 30) return '18_29';
  if (age < 40) return '30_39';
  if (age < 50) return '40_49';
  if (age < 60) return '50_59';
  return '60_plus';
};

export type V2RefinementContext = ReturnType<typeof buildV2RefinementContext>;

export const buildV2RefinementContext = (
  profile: NormalizedAthleteProfile,
  programme: LongitudinalOdinProgramme,
  validation: ProgrammeValidationReport,
  exercises: Exercise[],
) => {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );

  const sessionSummaries = programme.phases.flatMap((phase) =>
    phase.weeks.flatMap((week) =>
      week.days
        .filter((day) => day.day_type !== 'rest')
        .map((day) => ({
          day_id: day.day_id,
          phase_id: phase.phase_id,
          week_number: week.week_number,
          day_type: day.day_type,
          title: day.title,
          estimated_duration_min: day.estimated_duration_min,
          maximum_duration_min: day.maximum_duration_min,
          exercise_ids: day.exercises.map((exercise) => ({
            prescription_id: exercise.prescription_id,
            exercise_id: exercise.exercise_id,
            sequence_role: exercise.sequence_role,
            priority: exercise.priority,
            display_order: exercise.display_order,
            set_count: exercise.sets.length,
            working_set_count: exercise.sets.filter(
              (set) => set.set_type === 'working',
            ).length,
          })),
          conditioning_ids: day.conditioning.map((item) => ({
            conditioning_id: item.conditioning_id,
            activity_id: item.activity_id,
            placement: item.placement,
            duration_min: item.duration_min,
            interference_risk: item.interference_risk,
          })),
          warmup_component_count: day.warmup.length,
        })),
    ),
  );

  const exerciseAlternatives = programme.phases.flatMap((phase) =>
    phase.weeks.slice(0, 1).flatMap((week) =>
      week.days.flatMap((day) =>
        day.exercises
          .filter((prescription) => prescription.substitution_options)
          .map((prescription) => ({
            prescription_id: prescription.prescription_id,
            exercise_id: prescription.exercise_id,
            approved_candidate_ids:
              prescription.substitution_options?.approved_exercise_ids ?? [],
          })),
      ),
    ),
  );

  const conditioningAlternatives =
    programme.conditioning_policy.preferred_modalities.length > 0
      ? {
          preferred_modalities:
            programme.conditioning_policy.preferred_modalities,
          restricted_modalities:
            programme.conditioning_policy.restricted_modalities,
        }
      : undefined;

  const warmupComponents = programme.phases
    .flatMap((phase) =>
      phase.weeks.slice(0, 1).flatMap((week) =>
        week.days.flatMap((day) =>
          day.warmup.map((component) => ({
            warmup_id: component.warmup_id,
            day_id: day.day_id,
            component_type: component.component_type,
            activity_name: component.activity_name,
            related_exercise_id: component.related_exercise_id,
          })),
        ),
      ),
    )
    .filter(
      (component) =>
        component.component_type !== 'ramp_up_set' &&
        component.component_type !== 'pulse_raiser',
    );

  const context = {
    athlete: {
      age_band: ageBand(profile.source.age),
      sex: profile.source.sex,
      goal: profile.source.goal,
      fitness_level: profile.source.fitness_level,
      available_days: profile.source.available_days_per_week,
      session_duration_min: profile.source.session_duration_min,
      equipment: profile.source.equipment,
      recovery_capacity: profile.recovery_capacity,
      athlete_state: {
        training_status: profile.athlete_state.training_status,
        schedule_capacity: profile.athlete_state.schedule_capacity,
        recovery_capacity: profile.athlete_state.recovery_capacity,
        energy_availability: profile.athlete_state.energy_availability,
        adherence_confidence: profile.athlete_state.adherence_confidence,
        sport_interference_risk: profile.athlete_state.sport_interference_risk,
        conditioning_readiness: profile.athlete_state.conditioning_readiness,
        impact_tolerance: profile.athlete_state.impact_tolerance,
      },
      movement_restrictions: profile.movement_restrictions,
      health_flags: profile.health_flags.map(({ code, severity, message }) => ({
        code,
        severity,
        summary: message,
      })),
    },
    strategy: {
      primary_objective: programme.strategy.primary_objective,
      periodization_model: programme.strategy.periodization_model,
      split_type: programme.strategy.split_type,
      volume_strategy: programme.strategy.volume_strategy,
      intensity_strategy: programme.strategy.intensity_strategy,
      fatigue_strategy: programme.strategy.fatigue_strategy,
      conditioning_strategy: programme.strategy.conditioning_strategy,
    },
    phase_objectives: programme.phases.map((phase) => ({
      phase_id: phase.phase_id,
      phase_type: phase.phase_type,
      objective: phase.objective,
    })),
    week_objectives: programme.phases.flatMap((phase) =>
      phase.weeks.map((week) => ({
        week_number: week.week_number,
        week_type: week.week_type,
        objective: week.objective,
      })),
    ),
    session_summaries: sessionSummaries,
    exercise_alternatives: exerciseAlternatives,
    conditioning_alternatives: conditioningAlternatives,
    warmup_candidates: warmupComponents,
    validation_warnings: validation.findings
      .filter((finding) => finding.severity !== 'info')
      .slice(0, 20)
      .map((finding) => ({
        code: finding.code,
        severity: finding.severity,
        message: finding.message,
      })),
  };

  const serialized = JSON.stringify(context);
  if (serialized.length > MAX_CONTEXT_CHARACTERS) {
    const compact = {
      ...context,
      session_summaries: sessionSummaries.map((session) => ({
        day_id: session.day_id,
        day_type: session.day_type,
        title: session.title,
        exercise_ids: session.exercise_ids.map((exercise) => ({
          prescription_id: exercise.prescription_id,
          exercise_id: exercise.exercise_id,
          sequence_role: exercise.sequence_role,
        })),
        conditioning_ids: session.conditioning_ids.map((item) => ({
          conditioning_id: item.conditioning_id,
          activity_id: item.activity_id,
          interference_risk: item.interference_risk,
        })),
      })),
      warmup_candidates: [],
    };
    if (JSON.stringify(compact).length > MAX_CONTEXT_CHARACTERS) {
      throw refinementError(
        'REFINEMENT_CONTEXT_TOO_LARGE',
        'V2 refinement context exceeds the safe size limit.',
      );
    }
    return compact;
  }
  return context;
};
