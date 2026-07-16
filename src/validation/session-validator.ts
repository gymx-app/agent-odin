import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { evaluateExerciseEligibility } from '../exercises/eligibility.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

// Checks one candidate substitute against the approved library + eligibility
// rules, returning the finding if it fails either check (or null if it's a
// valid substitute). Extracted so a standalone "confirm this specific swap"
// check (outside the context of a full programme) can reuse the exact same
// codes/messages as the full-programme validator below.
export const checkSubstitutionCandidate = (
  sourceExerciseId: string,
  substituteId: string,
  exerciseById: Map<string, Exercise>,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding | null => {
  const substitute = exerciseById.get(substituteId);

  if (!substitute) {
    return finding(
      validationCodes.SUBSTITUTION_GROUP_INVALID,
      'error',
      'exercise_integrity',
      'Substitution group contains an unknown exercise ID.',
      {
        metadata: {
          exercise_id: sourceExerciseId,
          substitute_id: substituteId,
        },
      },
    );
  }

  if (evaluateExerciseEligibility(substitute, profile).status === 'excluded') {
    return finding(
      validationCodes.SUBSTITUTE_EXERCISE_EXCLUDED,
      'error',
      'exercise_integrity',
      'Substitution group contains an excluded exercise.',
      {
        metadata: {
          exercise_id: sourceExerciseId,
          substitute_id: substituteId,
        },
      },
    );
  }

  return null;
};

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
            if (
              prescription.modification_metadata &&
              prescription.modification_metadata.restriction_tags.length >
                0 &&
              prescription.progression_bounds.load_increment_type !== 'none'
            ) {
              add(
                'RESTRICTED_EXERCISE_LOAD_PROGRESSION_NOT_SUPPRESSED',
                'error',
                'prescription_quality',
                'Exercise has an active movement restriction but load progression was not suppressed in favor of reps/ROM.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              ['drop_set', 'rest_pause'].includes(
                prescription.set_structure.type,
              ) &&
              approved.exercise_type === 'compound' &&
              ['primary', 'secondary'].includes(prescription.sequence_role)
            ) {
              add(
                'UNSAFE_SET_STRUCTURE_ON_COMPOUND_LIFT',
                'error',
                'prescription_quality',
                'Drop sets and rest-pause are for isolation/accessory work only, not primary or secondary compound lifts.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              prescription.set_structure.type === 'cluster' &&
              !(
                approved.exercise_type === 'compound' &&
                ['primary', 'secondary'].includes(prescription.sequence_role)
              )
            ) {
              add(
                'CLUSTER_SET_OFF_TARGET_USE',
                'warning',
                'prescription_quality',
                'Cluster sets are for velocity/power preservation on compound primary/secondary lifts, not isolation/accessory work.',
                { exercise_id: prescription.exercise_id },
              );
            }
            if (
              prescription.exercise_name !==
              (approved.display_name ?? approved.name)
            ) {
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
              // odin-programme-design-logic.md, Section 5: failure exposure
              // (rpe_ceiling pushed to true failure) must never happen when
              // the week's policy is 'none', and never on an exercise
              // carrying an active movement restriction (Item 1's reps/ROM
              // priority always wins), regardless of what the policy allows.
              if (
                set.rpe_ceiling >= 10 &&
                (week.planning_metadata.intensity_target
                  .failure_exposure_policy === 'none' ||
                  prescription.modification_metadata !== undefined)
              ) {
                add(
                  'UNSAFE_FAILURE_EXPOSURE',
                  'error',
                  'prescription_quality',
                  'A set is exposed to true failure (rpe_ceiling 10) despite failure_exposure_policy being "none" or an active movement restriction on this exercise.',
                  { exercise_id: prescription.exercise_id },
                );
              }
            });
            prescription.substitution_options?.approved_exercise_ids.forEach(
              (substituteId) => {
                const substitutionFinding = checkSubstitutionCandidate(
                  prescription.exercise_id,
                  substituteId,
                  exerciseById,
                  profile,
                );
                if (substitutionFinding) {
                  findings.push(substitutionFinding);
                }
              },
            );
          });
          const groups = new Map<string, typeof day.exercises>();
          day.exercises.forEach((exercise) => {
            if (!exercise.superset_group_id) return;
            const group = groups.get(exercise.superset_group_id) ?? [];
            group.push(exercise);
            groups.set(exercise.superset_group_id, group);
          });
          groups.forEach((members, groupId) => {
            const expectedType =
              members.length >= 3 ? 'giant_set' : 'superset';
            const hasStrengthPrimaryMember = members.some(
              (member) =>
                member.sequence_role === 'primary' &&
                exerciseById.get(member.exercise_id)?.exercise_type ===
                  'compound',
            );
            if (hasStrengthPrimaryMember) {
              add(
                'SUPERSET_ON_PRIMARY_STRENGTH_LIFT',
                'error',
                'prescription_quality',
                `superset_group_id ${groupId} groups a primary compound lift into a superset/giant set — elevated fatigue degrades force output on subsequent exercises.`,
                { week_number: week.week_number, cycle_day: day.cycle_day },
              );
            }
            if (
              members.some(
                (member) => member.set_structure.type !== expectedType,
              )
            ) {
              add(
                'SUPERSET_GROUP_TYPE_MISMATCH',
                'error',
                'prescription_quality',
                `superset_group_id ${groupId} members must all use set_structure.type '${expectedType}' matching the group size.`,
                { week_number: week.week_number, cycle_day: day.cycle_day },
              );
            }
          });
        });
    });
  });
  return findings;
};
