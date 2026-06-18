import { matchExerciseEquipment } from '../exercises/equipment-matching.js';
import { validationCodes } from './validation-codes.js';
import { finding, programmeExercises } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

export const validateAthleteConstraints: ProgrammeValidator = ({
  programme,
  profile,
  exerciseById,
}) => {
  const findings: ProgrammeValidationFinding[] = [];

  profile.movement_restrictions.forEach((restriction) => {
    if (!restriction.tag) {
      findings.push(
        finding(
          validationCodes.UNKNOWN_RESTRICTION_TAG,
          'warning',
          'constraint_fit',
          'Movement restriction could not be interpreted.',
        ),
      );
    }
  });

  programmeExercises(programme).forEach(({ phase_number, day, exercise }) => {
    const approvedExercise = exerciseById.get(exercise.exercise_id);

    if (!approvedExercise) {
      return;
    }

    const equipmentMatch = matchExerciseEquipment(
      approvedExercise,
      profile.source.equipment,
    );

    if (!equipmentMatch.compatible) {
      findings.push(
        finding(
          validationCodes.EQUIPMENT_UNAVAILABLE,
          'error',
          'constraint_fit',
          'Exercise requires unavailable equipment.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            metadata: {
              missing_equipment: equipmentMatch.missing_equipment,
            },
          },
        ),
      );
    }

    if (profile.excluded_exercise_ids.includes(exercise.exercise_id)) {
      findings.push(
        finding(
          validationCodes.EXCLUDED_EXERCISE_USED,
          'error',
          'constraint_fit',
          'Programme uses an exercise explicitly excluded for the athlete.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    profile.movement_restrictions.forEach((restriction) => {
      const demandScore = approvedExercise.movement_demands[restriction.tag];

      if (demandScore <= 0) {
        return;
      }

      if (restriction.severity === 'avoid') {
        findings.push(
          finding(
            validationCodes.AVOID_RESTRICTION_VIOLATION,
            'error',
            'constraint_fit',
            'Exercise conflicts with an avoid movement restriction.',
            {
              phase_number,
              day_of_week: day.day_of_week,
              exercise_id: exercise.exercise_id,
              metadata: {
                restriction_tag: restriction.tag,
                demand_score: demandScore,
              },
            },
          ),
        );
        return;
      }

      findings.push(
        finding(
          validationCodes.MODIFY_RESTRICTION_PRESENT,
          demandScore >= 4 ? 'error' : 'warning',
          'constraint_fit',
          'Exercise has a non-zero demand for a modify restriction.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            metadata: {
              restriction_tag: restriction.tag,
              demand_score: demandScore,
            },
          },
        ),
      );
    });
  });

  return findings;
};
