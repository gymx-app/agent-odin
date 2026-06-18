import { OdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import { DAYS_OF_WEEK } from '../domain/shared/domain-enums.js';
import { validationCodes } from './validation-codes.js';
import { finding, uniqueCount } from './validation-helpers.js';
import type { ProgrammeValidator } from './validation.types.js';

const isSequential = (values: number[]): boolean =>
  values.every((value, index) => value === index + 1);

export const validateStructure: ProgrammeValidator = ({ programme }) => {
  const findings = [];
  const schemaResult = OdinProgrammeSchema.safeParse(programme);

  if (!schemaResult.success) {
    findings.push(
      finding(
        validationCodes.PROGRAMME_SCHEMA_INVALID,
        'error',
        'structure',
        'Programme does not satisfy OdinProgrammeSchema.',
        {
          metadata: {
            issues: schemaResult.error.issues.map((issue) => issue.message),
          },
        },
      ),
    );
  }

  if (programme.config.total_phases !== programme.phases.length) {
    findings.push(
      finding(
        validationCodes.PHASE_COUNT_MISMATCH,
        'error',
        'structure',
        'Configured phase count does not match phases array.',
      ),
    );
  }

  if (programme.phase_week_templates.length !== programme.config.total_phases) {
    findings.push(
      finding(
        validationCodes.WEEK_TEMPLATE_COUNT_MISMATCH,
        'error',
        'structure',
        'Phase week-template count does not match total phases.',
      ),
    );
  }

  if (
    uniqueCount(programme.phases.map((phase) => phase.phase_number)) !==
    programme.phases.length
  ) {
    findings.push(
      finding(
        validationCodes.DUPLICATE_PHASE_NUMBER,
        'error',
        'structure',
        'Phase numbers must be unique.',
      ),
    );
  }

  if (programme.programme.started_at !== programme.config.start_date) {
    findings.push(
      finding(
        validationCodes.START_DATE_MISMATCH,
        'error',
        'structure',
        'Programme start date and config start date must match.',
      ),
    );
  }

  programme.phases.forEach((phase, index) => {
    if (programme.config.phase_weeks[index] !== phase.weeks_count) {
      findings.push(
        finding(
          validationCodes.PHASE_WEEK_COUNT_MISMATCH,
          'error',
          'structure',
          'Phase week count does not match config phase_weeks.',
          { phase_number: phase.phase_number },
        ),
      );
    }
  });

  programme.phase_week_templates.forEach((template) => {
    const weekdays = template.days.map((day) => day.day_of_week);

    DAYS_OF_WEEK.forEach((weekday) => {
      if (!weekdays.includes(weekday)) {
        findings.push(
          finding(
            validationCodes.MISSING_WEEKDAY,
            'error',
            'structure',
            `Week template is missing ${weekday}.`,
            { phase_number: template.phase_number, day_of_week: weekday },
          ),
        );
      }
    });

    if (uniqueCount(weekdays) !== weekdays.length) {
      findings.push(
        finding(
          validationCodes.DUPLICATE_WEEKDAY,
          'error',
          'structure',
          'Week template contains duplicate weekdays.',
          { phase_number: template.phase_number },
        ),
      );
    }

    template.days.forEach((day) => {
      if (day.workout_type === 'workout' && day.exercises.length === 0) {
        findings.push(
          finding(
            validationCodes.WORKOUT_WITHOUT_EXERCISES,
            'error',
            'structure',
            'Workout day must contain at least one exercise.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }

      if (day.workout_type === 'liss') {
        if (day.exercises.length > 0) {
          findings.push(
            finding(
              validationCodes.LISS_WITH_EXERCISES,
              'error',
              'structure',
              'LISS day must not contain exercises.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
              },
            ),
          );
        }

        if (day.liss_content === null) {
          findings.push(
            finding(
              validationCodes.LISS_WITHOUT_CONTENT,
              'error',
              'structure',
              'LISS day requires liss_content.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
              },
            ),
          );
        }
      }

      if (day.workout_type === 'rest') {
        if (day.exercises.length > 0) {
          findings.push(
            finding(
              validationCodes.REST_WITH_EXERCISES,
              'error',
              'structure',
              'Rest day must not contain exercises.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
              },
            ),
          );
        }

        if (day.liss_content !== null) {
          findings.push(
            finding(
              validationCodes.REST_WITH_LISS_CONTENT,
              'error',
              'structure',
              'Rest day must have null liss_content.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
              },
            ),
          );
        }
      }

      if (
        uniqueCount(day.exercises.map((exercise) => exercise.display_order)) !==
        day.exercises.length
      ) {
        findings.push(
          finding(
            validationCodes.DUPLICATE_DISPLAY_ORDER,
            'error',
            'structure',
            'Exercise display_order values must be unique within a day.',
            {
              phase_number: template.phase_number,
              day_of_week: day.day_of_week,
            },
          ),
        );
      }

      day.exercises.forEach((exercise) => {
        const setNumbers = exercise.sets.map((set) => set.set_number);

        if (
          uniqueCount(setNumbers) !== setNumbers.length ||
          !isSequential(setNumbers)
        ) {
          findings.push(
            finding(
              validationCodes.NON_SEQUENTIAL_SET_NUMBERS,
              'error',
              'structure',
              'Set numbers must be unique and sequential.',
              {
                phase_number: template.phase_number,
                day_of_week: day.day_of_week,
                exercise_id: exercise.exercise_id,
              },
            ),
          );
        }
      });
    });
  });

  return findings;
};
