import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import { findExerciseSubstitutions } from '../exercises/substitutions.js';
import type { ProgrammeValidationReport } from '../validation/validation.types.js';
import { refinementError } from './refinement-errors.js';

const MAX_ALTERNATIVES_PER_EXERCISE = 5;
const MAX_CONTEXT_CHARACTERS = 90000;

const ageBand = (age: number): string => {
  if (age < 18) return 'under_18';
  if (age < 30) return '18_29';
  if (age < 40) return '30_39';
  if (age < 50) return '40_49';
  if (age < 60) return '50_59';
  return '60_plus';
};

const exerciseOption = (exercise: Exercise) => ({
  exercise_id: exercise.id,
  display_name: exercise.name,
  movement_patterns: exercise.movement_patterns,
  primary_muscles: exercise.primary_muscles,
  equipment: exercise.equipment,
  difficulty: exercise.difficulty,
  fatigue_cost: exercise.fatigue_cost,
  movement_demands: exercise.movement_demands,
  substitution_group: exercise.substitution_group,
});

export type RefinementContext = ReturnType<typeof buildRefinementContext>;

export const buildRefinementContext = (
  profile: NormalizedAthleteProfile,
  programme: OdinProgramme,
  validation: ProgrammeValidationReport,
  exercises: Exercise[],
) => {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const alternatives = programme.phase_week_templates.flatMap((template) =>
    template.days.flatMap((day) =>
      day.exercises.flatMap((prescription) => {
        const current = exerciseById.get(prescription.exercise_id);

        if (!current) {
          return [];
        }

        return [
          {
            phase_number: template.phase_number,
            day_of_week: day.day_of_week,
            exercise_id: current.id,
            options: [
              exerciseOption(current),
              ...findExerciseSubstitutions(current, exercises, profile)
                .slice(0, MAX_ALTERNATIVES_PER_EXERCISE)
                .map(({ exercise }) => exerciseOption(exercise)),
            ],
          },
        ];
      }),
    ),
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
      movement_restrictions: profile.movement_restrictions,
      health_flags: profile.health_flags.map(({ code, severity, message }) => ({
        code,
        severity,
        summary: message,
      })),
      programme_confidence: profile.programme_confidence,
      assumptions: profile.assumptions,
      has_inbody: profile.source.inbody !== null,
    },
    baseline: {
      programme,
      validation,
      split: programme.phase_week_templates[0]?.days
        .filter((day) => day.workout_type === 'workout')
        .map((day) => day.title),
      strategy_rationale_codes: [
        ...new Set(
          programme.phase_week_templates.flatMap((template) =>
            template.days.flatMap((day) => day.tags),
          ),
        ),
      ],
      warnings: programme.validation_summary.warnings,
    },
    exercise_alternatives: alternatives,
  };

  if (JSON.stringify(context).length > MAX_CONTEXT_CHARACTERS) {
    const compactContext = {
      ...context,
      exercise_alternatives: alternatives.map((entry) => ({
        ...entry,
        options: entry.options.map((option) => ({
          exercise_id: option.exercise_id,
          display_name: option.display_name,
          movement_patterns: option.movement_patterns,
          equipment: option.equipment,
          difficulty: option.difficulty,
        })),
      })),
    };

    if (JSON.stringify(compactContext).length > MAX_CONTEXT_CHARACTERS) {
      throw refinementError(
        'REFINEMENT_CONTEXT_TOO_LARGE',
        'Refinement context exceeds the safe size limit.',
      );
    }

    return compactContext;
  }

  return context;
};
