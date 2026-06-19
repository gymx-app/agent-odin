import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { OdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import { evaluateExerciseEligibility } from '../exercises/eligibility.js';
import { findExerciseSubstitutions } from '../exercises/substitutions.js';
import { estimateWorkoutDurationMinutes } from '../planning/session-duration-estimator.js';
import type { ProgrammeRefinementProposal } from './refinement.types.js';
import { refinementError } from './refinement-errors.js';

const specificWeightPattern =
  /\b\d+(?:\.\d+)?\s*(?:kg|kgs|kilograms?|lb|lbs|pounds?)\b/i;
const difficultyRank = { beginner: 1, intermediate: 2, advanced: 3 };

const operationKey = (
  operation: ProgrammeRefinementProposal['operations'][number],
) =>
  [
    operation.phase_number,
    operation.day_of_week,
    operation.exercise_id,
    operation.set_number,
    operation.type,
  ].join(':');

const operationPriority: Record<
  ProgrammeRefinementProposal['operations'][number]['type'],
  number
> = {
  adjust_target_reps: 10,
  adjust_target_rpe: 20,
  adjust_rest_seconds: 30,
  adjust_set_count: 40,
  add_coaching_cue: 50,
  reorder_exercise: 60,
  replace_exercise: 70,
  adjust_liss_duration: 80,
  update_subtitle: 90,
  add_review_trigger: 100,
  add_assumption: 110,
  no_change: 120,
};

export const applyProgrammeRefinement = (
  baseline: OdinProgramme,
  proposal: ProgrammeRefinementProposal,
  exercises: Exercise[],
  profile: NormalizedAthleteProfile,
): OdinProgramme => {
  if (
    (baseline as OdinProgramme & { schema_version?: string }).schema_version ===
    '2.0'
  ) {
    throw refinementError(
      'REFINEMENT_PROGRAMME_VERSION_UNSUPPORTED',
      'V1 refinement operations cannot be applied to schema version 2.0.',
    );
  }

  const programme = structuredClone(baseline);
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const seenTargets = new Set<string>();

  [...proposal.operations]
    .sort(
      (left, right) =>
        operationPriority[left.type] - operationPriority[right.type] ||
        left.operation_id.localeCompare(right.operation_id),
    )
    .forEach((operation) => {
      const targetKey = operationKey(operation);

      if (seenTargets.has(targetKey)) {
        throw refinementError(
          'REFINEMENT_PROPOSAL_INVALID',
          'Proposal contains conflicting operations.',
          { operation_id: operation.operation_id },
        );
      }
      seenTargets.add(targetKey);

      if (operation.type === 'no_change') return;

      if (operation.type === 'add_review_trigger') {
        if (operation.review_trigger) {
          programme.review_triggers.push(operation.review_trigger);
        }
        return;
      }

      if (operation.type === 'add_assumption') {
        programme.assumptions.push(operation.reason);
        return;
      }

      const template = programme.phase_week_templates.find(
        (candidate) => candidate.phase_number === operation.phase_number,
      );
      const day = template?.days.find(
        (candidate) => candidate.day_of_week === operation.day_of_week,
      );

      if (!template || !day) {
        throw refinementError(
          'REFINEMENT_REFERENCE_INVALID',
          'Refinement operation references an unknown phase or day.',
          { operation_id: operation.operation_id },
        );
      }

      if (operation.type === 'adjust_liss_duration') {
        if (
          day.workout_type !== 'liss' ||
          operation.new_liss_duration_min === null ||
          operation.new_liss_duration_min < 10 ||
          operation.new_liss_duration_min > profile.source.session_duration_min
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'LISS duration adjustment is outside permitted boundaries.',
          );
        }
        day.duration_min = operation.new_liss_duration_min;
        return;
      }

      if (operation.type === 'update_subtitle') {
        day.subtitle = operation.new_subtitle ?? day.subtitle;
        return;
      }

      const prescription = day.exercises.find(
        (candidate) => candidate.exercise_id === operation.exercise_id,
      );

      if (!prescription) {
        throw refinementError(
          'REFINEMENT_REFERENCE_INVALID',
          'Refinement operation references an unknown programme exercise.',
          { operation_id: operation.operation_id },
        );
      }

      if (operation.type === 'replace_exercise') {
        const replacement = operation.replacement_exercise_id
          ? exerciseById.get(operation.replacement_exercise_id)
          : undefined;
        const current = exerciseById.get(prescription.exercise_id);

        if (!replacement || !current) {
          throw refinementError(
            'REFINEMENT_EXERCISE_UNKNOWN',
            'Replacement exercise is not in the approved library.',
          );
        }
        const allowedReplacementIds = new Set(
          findExerciseSubstitutions(current, exercises, profile)
            .slice(0, 5)
            .map(({ exercise }) => exercise.id),
        );
        if (
          !allowedReplacementIds.has(replacement.id) ||
          !replacement.movement_patterns.some((pattern) =>
            current.movement_patterns.includes(pattern),
          ) ||
          evaluateExerciseEligibility(replacement, profile).status !==
            'eligible' ||
          difficultyRank[replacement.difficulty] >
            difficultyRank[profile.source.fitness_level] ||
          day.exercises.some(
            (candidate) => candidate.exercise_id === replacement.id,
          )
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Replacement exercise is not eligible for this programme slot.',
          );
        }

        prescription.exercise_id = replacement.id;
        prescription.exercise_name = replacement.name;
        prescription.equipment = replacement.equipment;
        prescription.movement_patterns = replacement.movement_patterns;
        prescription.primary_muscles = replacement.primary_muscles;
        prescription.secondary_muscles = replacement.secondary_muscles;
        return;
      }

      if (operation.type === 'reorder_exercise') {
        if (
          operation.new_display_order === null ||
          Math.abs(operation.new_display_order - prescription.display_order) > 1
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Exercise order may move by at most one position.',
          );
        }
        prescription.display_order =
          operation.new_display_order ?? prescription.display_order;
        day.exercises
          .sort(
            (left, right) =>
              left.display_order - right.display_order ||
              left.exercise_id.localeCompare(right.exercise_id),
          )
          .forEach((exercise, index) => {
            exercise.display_order = index;
          });
        const exerciseTypes = day.exercises.map(
          (exercise) => exerciseById.get(exercise.exercise_id)?.exercise_type,
        );
        const firstIsolation = exerciseTypes.indexOf('isolation');
        const lastCompound = exerciseTypes.lastIndexOf('compound');

        if (firstIsolation >= 0 && lastCompound > firstIsolation) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Exercise order must keep compound work before isolation work.',
          );
        }
        return;
      }

      if (operation.type === 'adjust_set_count') {
        const target = operation.new_set_count ?? prescription.sets.length;
        const difference = target - prescription.sets.length;

        if (Math.abs(difference) > 1 || target < 2) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Set count may change by at most one and must remain at least two.',
          );
        }
        if (difference < 0) {
          prescription.sets = prescription.sets.slice(0, target);
        } else if (difference > 0) {
          const last = prescription.sets.at(-1)!;
          prescription.sets.push({
            ...last,
            set_number: prescription.sets.length + 1,
            set_type: 'working',
          });
        }
        return;
      }

      if (operation.type === 'add_coaching_cue') {
        if (
          !operation.coaching_cue ||
          specificWeightPattern.test(operation.coaching_cue)
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Coaching cue is invalid or prescribes a specific weight.',
          );
        }
        prescription.coaching_cues.push(operation.coaching_cue);
        return;
      }

      const set = prescription.sets.find(
        (candidate) => candidate.set_number === operation.set_number,
      );

      if (!set) {
        throw refinementError(
          'REFINEMENT_REFERENCE_INVALID',
          'Refinement operation references an unknown set.',
        );
      }

      if (operation.type === 'adjust_target_reps') {
        const target = operation.new_target_reps!;
        if (
          Math.abs(target - set.target_reps) > 2 ||
          target < prescription.progression_bounds.rep_min ||
          target > prescription.progression_bounds.rep_max
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Target rep adjustment is outside permitted boundaries.',
          );
        }
        set.target_reps = target;
      } else if (operation.type === 'adjust_target_rpe') {
        const target = operation.new_target_rpe!;
        const ceiling = operation.new_rpe_ceiling!;
        if (
          Math.abs(target - set.target_rpe) > 1 ||
          Math.abs(ceiling - set.rpe_ceiling) > 1 ||
          target > ceiling ||
          target > 8 ||
          ceiling > 8
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'RPE adjustment is outside permitted boundaries.',
          );
        }
        set.target_rpe = target;
        set.rpe_ceiling = ceiling;
      } else if (operation.type === 'adjust_rest_seconds') {
        const rest = operation.new_rest_seconds!;
        const approvedExercise = exerciseById.get(prescription.exercise_id);
        if (
          Math.abs(rest - set.rest_seconds) > 60 ||
          !approvedExercise ||
          rest < approvedExercise.default_rest_seconds.min ||
          rest > approvedExercise.default_rest_seconds.max
        ) {
          throw refinementError(
            'REFINEMENT_OPERATION_FORBIDDEN',
            'Rest adjustment is outside permitted boundaries.',
          );
        }
        set.rest_seconds = rest;
      }
    });

  proposal.assumptions.forEach((assumption) =>
    programme.assumptions.push(assumption),
  );
  proposal.review_triggers.forEach((trigger) =>
    programme.review_triggers.push(trigger),
  );

  programme.phase_week_templates.forEach((template) => {
    template.days.forEach((day) => {
      if (day.workout_type === 'workout') {
        day.duration_min = estimateWorkoutDurationMinutes(
          day.exercises,
          exercises,
        );
      }
    });
  });

  const parsed = OdinProgrammeSchema.safeParse(programme);

  if (!parsed.success) {
    throw refinementError(
      'REFINEMENT_APPLICATION_FAILED',
      'Refined programme does not satisfy the programme schema.',
      { issues: parsed.error.issues.map((issue) => issue.message) },
    );
  }

  return parsed.data;
};
