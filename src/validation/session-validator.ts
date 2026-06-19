import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { evaluateExerciseEligibility } from '../exercises/eligibility.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

const canonicalTitles = [
  'Full Body',
  'Upper Body',
  'Lower Body',
  'Push',
  'Pull',
  'Legs',
  'Specialized',
  'Sport Support',
];

export const validateLongitudinalSessions = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    category:
      | 'structure'
      | 'exercise_integrity'
      | 'prescription_quality'
      | 'session_time_fit'
      | 'naming_quality',
    message: string,
    metadata: Record<string, unknown> = {},
  ) =>
    findings.push(
      finding(validationCodes[code], severity, category, message, { metadata }),
    );

  programme.phases.forEach((phase) => {
    phase.weeks.forEach((week) => {
      week.days
        .filter((day) => day.day_type === 'resistance')
        .forEach((day) => {
          const ids = day.exercises.map((exercise) => exercise.exercise_id);
          if (ids.length === 0) {
            add(
              'REQUIRED_MOVEMENT_SLOT_MISSING',
              'error',
              'structure',
              'Resistance session has no selected exercises.',
              { week_number: week.week_number, cycle_day: day.cycle_day },
            );
          }
          if (new Set(ids).size !== ids.length) {
            add(
              'DUPLICATE_EXERCISE_IN_SESSION',
              'error',
              'exercise_integrity',
              'Resistance session contains a duplicate exercise ID.',
              { week_number: week.week_number, cycle_day: day.cycle_day },
            );
          }
          const setCount = day.exercises.reduce(
            (sum, exercise) => sum + exercise.sets.length,
            0,
          );
          if (
            day.training_budget &&
            setCount !== day.training_budget.total_working_set_budget
          ) {
            add(
              'WORKING_SET_BUDGET_MISMATCH',
              'error',
              'prescription_quality',
              'Selected working sets do not match the session budget.',
              { week_number: week.week_number, cycle_day: day.cycle_day },
            );
          }
          if (
            day.estimated_duration_min !== null &&
            day.maximum_duration_min !== null &&
            day.estimated_duration_min > day.maximum_duration_min
          ) {
            add(
              'SESSION_DURATION_EXCEEDED',
              'error',
              'session_time_fit',
              'Resistance session exceeds its maximum duration.',
              { week_number: week.week_number, cycle_day: day.cycle_day },
            );
          }
          if (
            !canonicalTitles.some(
              (title) =>
                day.title === title || day.title.startsWith(`${title} — `),
            )
          ) {
            add(
              'NON_CANONICAL_SESSION_NAME',
              'error',
              'naming_quality',
              'Resistance session title is not canonical.',
              { week_number: week.week_number, cycle_day: day.cycle_day },
            );
          }
          day.exercises.forEach((prescription) => {
            const approved = exerciseById.get(prescription.exercise_id);
            if (!approved) {
              add(
                'UNKNOWN_EXERCISE_ID',
                'error',
                'exercise_integrity',
                'Selected exercise ID is not in the approved library.',
                { exercise_id: prescription.exercise_id },
              );
              return;
            }
            const eligibility = evaluateExerciseEligibility(approved, profile);
            if (eligibility.status === 'excluded') {
              add(
                'EXCLUDED_EXERCISE_SELECTED',
                'error',
                'exercise_integrity',
                'Selected exercise is excluded for the athlete.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              eligibility.status === 'modifiable' &&
              !prescription.modification_metadata
            ) {
              add(
                'MODIFICATION_METADATA_MISSING',
                'error',
                'exercise_integrity',
                'Modifiable exercise lacks explicit modification metadata.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (prescription.exercise_name !== approved.name) {
              add(
                'NON_CANONICAL_EXERCISE_NAME',
                'error',
                'naming_quality',
                'Exercise name does not match the approved library.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              !prescription.progression_rule_id ||
              !prescription.user_progression_rule
            ) {
              add(
                'PROGRESSION_POLICY_MISSING',
                'error',
                'prescription_quality',
                'Exercise prescription lacks progression metadata.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              new Set(prescription.sets.map((set) => set.set_number)).size !==
              prescription.sets.length
            ) {
              add(
                'SET_NUMBER_DUPLICATE',
                'error',
                'prescription_quality',
                'Exercise contains duplicate set numbers.',
                { exercise_id: prescription.exercise_id },
              );
            }
            prescription.sets.forEach((set) => {
              if (
                !Number.isInteger(set.target_reps) ||
                !Number.isFinite(set.target_rpe) ||
                !Number.isInteger(set.rest_seconds)
              ) {
                add(
                  'VAGUE_SET_PRESCRIPTION',
                  'error',
                  'prescription_quality',
                  'Exercise set prescription must be exact.',
                  { exercise_id: prescription.exercise_id },
                );
              }
              if (
                set.rest_seconds < approved.default_rest_seconds.min ||
                set.rest_seconds > approved.default_rest_seconds.max
              ) {
                add(
                  'REST_PRESCRIPTION_INVALID',
                  'error',
                  'prescription_quality',
                  'Rest prescription is outside the approved exercise range.',
                  { exercise_id: prescription.exercise_id },
                );
              }
            });
            prescription.substitution_options?.approved_exercise_ids.forEach(
              (substituteId) => {
                const substitute = exerciseById.get(substituteId);
                if (!substitute) {
                  add(
                    'SUBSTITUTION_GROUP_INVALID',
                    'error',
                    'exercise_integrity',
                    'Substitution group contains an unknown exercise ID.',
                    {
                      exercise_id: prescription.exercise_id,
                      substitute_id: substituteId,
                    },
                  );
                } else if (
                  evaluateExerciseEligibility(substitute, profile).status ===
                  'excluded'
                ) {
                  add(
                    'SUBSTITUTE_EXERCISE_EXCLUDED',
                    'error',
                    'exercise_integrity',
                    'Substitution group contains an excluded exercise.',
                    {
                      exercise_id: prescription.exercise_id,
                      substitute_id: substituteId,
                    },
                  );
                }
              },
            );
          });
        });
    });
  });
  return findings;
};
