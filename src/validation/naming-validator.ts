import {
  exerciseDisplayName,
  programmeNameForGoal,
} from '../planning/programme-labels.js';
import { validationCodes } from './validation-codes.js';
import { finding, programmeExercises } from './validation-helpers.js';
import type { ProgrammeValidator } from './validation.types.js';

const canonicalWorkoutTitles = [
  'Upper Body',
  'Lower Body',
  'Push',
  'Pull',
  'Legs',
  'Full Body',
  'LISS Cardio',
  'Rest',
  'Upper Body — Strength',
  'Upper Body — Hypertrophy',
  'Lower Body — Quad Focus',
  'Lower Body — Posterior Chain',
  'Push — Chest Focus',
  'Pull — Back Focus',
  'Full Body — Strength',
];

const bannedLabelWords = ['warrior', 'forge', 'myth', 'ultimate', 'shred'];

export const validateNaming: ProgrammeValidator = ({
  programme,
  profile,
  exerciseById,
}) => {
  const findings = [];
  const nameWords = programme.programme.name.split(/\s+/);

  if (
    nameWords.length > 5 ||
    programme.programme.name.includes(profile.source.name) ||
    bannedLabelWords.some((word) =>
      programme.programme.name.toLowerCase().includes(word),
    )
  ) {
    findings.push(
      finding(
        validationCodes.VERBOSE_PROGRAMME_NAME,
        'warning',
        'naming_quality',
        'Programme name should be concise and professional.',
      ),
    );
  }

  if (programme.programme.name !== programmeNameForGoal(profile.source.goal)) {
    findings.push(
      finding(
        validationCodes.VERBOSE_PROGRAMME_NAME,
        'warning',
        'naming_quality',
        'Programme name differs from the canonical Phase 4 label.',
      ),
    );
  }

  programme.phases.forEach((phase) => {
    if (phase.name !== 'Foundation') {
      findings.push(
        finding(
          validationCodes.NON_FOUNDATION_PHASE_NAME,
          'warning',
          'naming_quality',
          'Phase name should be Foundation for baseline programmes.',
          { phase_number: phase.phase_number },
        ),
      );
    }
  });

  programme.phase_week_templates.forEach((template) => {
    template.days.forEach((day) => {
      if (!canonicalWorkoutTitles.includes(day.title)) {
        findings.push(
          finding(
            validationCodes.NON_CANONICAL_WORKOUT_TITLE,
            'warning',
            'naming_quality',
            'Workout title is not a canonical session name.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }
    });
  });

  programmeExercises(programme).forEach(({ phase_number, day, exercise }) => {
    const approvedExercise = exerciseById.get(exercise.exercise_id);

    if (!approvedExercise) {
      return;
    }

    if (exercise.exercise_name !== exerciseDisplayName(approvedExercise.name)) {
      findings.push(
        finding(
          validationCodes.EXERCISE_DISPLAY_NAME_MISMATCH,
          'error',
          'naming_quality',
          'Exercise display name does not match approved naming rules.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }

    if (exercise.exercise_name.split(/\s+/).length > 5) {
      findings.push(
        finding(
          validationCodes.VERBOSE_EXERCISE_NAME,
          'warning',
          'naming_quality',
          'Exercise display name is too verbose.',
          {
            phase_number,
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
          },
        ),
      );
    }
  });

  return findings;
};
