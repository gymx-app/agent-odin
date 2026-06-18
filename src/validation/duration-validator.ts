import { estimateWorkoutDurationMinutes } from '../planning/session-duration-estimator.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

export const validateDuration: ProgrammeValidator = ({
  programme,
  profile,
  exercises,
}) => {
  const findings: ProgrammeValidationFinding[] = [];

  programme.phase_week_templates.forEach((template) => {
    template.days.forEach((day) => {
      if (day.workout_type === 'workout') {
        const recalculatedDuration = estimateWorkoutDurationMinutes(
          day.exercises,
          exercises,
        );
        const margin =
          profile.source.session_duration_min - recalculatedDuration;

        if (margin < -2) {
          findings.push(
            finding(
              validationCodes.WORKOUT_DURATION_EXCEEDED,
              'error',
              'session_time_fit',
              'Workout exceeds available session duration.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
                metadata: {
                  recalculated_duration: recalculatedDuration,
                  session_duration: profile.source.session_duration_min,
                },
              },
            ),
          );
        } else if (margin <= 2) {
          findings.push(
            finding(
              validationCodes.LOW_DURATION_MARGIN,
              'warning',
              'session_time_fit',
              'Workout is within two minutes of the available session duration.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
              },
            ),
          );
        }
      }

      if (
        day.workout_type === 'liss' &&
        day.duration_min !== null &&
        day.duration_min > profile.source.session_duration_min
      ) {
        findings.push(
          finding(
            validationCodes.LISS_DURATION_EXCEEDED,
            'error',
            'session_time_fit',
            'LISS duration exceeds available session duration.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }

      if (day.workout_type === 'rest' && day.duration_min !== null) {
        findings.push(
          finding(
            validationCodes.REST_DURATION_PRESENT,
            'warning',
            'session_time_fit',
            'Rest day should use null duration.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }
    });
  });

  return findings;
};
