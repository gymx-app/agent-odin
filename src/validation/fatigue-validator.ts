import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

const dailyFatigue = (
  day: Parameters<ProgrammeValidator>[0]['programme']['phase_week_templates'][number]['days'][number],
  exerciseById: Parameters<ProgrammeValidator>[0]['exerciseById'],
) =>
  day.exercises.reduce(
    (total, prescription) => {
      const exercise = exerciseById.get(prescription.exercise_id);
      const setCount = prescription.sets.length;
      const rpeAverage =
        prescription.sets.reduce((sum, set) => sum + set.target_rpe, 0) /
        setCount;
      const rpeMultiplier = rpeAverage / 7;

      if (!exercise) {
        return total;
      }

      return {
        systemic:
          total.systemic +
          exercise.fatigue_cost.systemic * setCount * rpeMultiplier,
        axial:
          total.axial + exercise.fatigue_cost.axial * setCount * rpeMultiplier,
        grip:
          total.grip + exercise.fatigue_cost.grip * setCount * rpeMultiplier,
      };
    },
    { systemic: 0, axial: 0, grip: 0 },
  );

export const validateFatigue: ProgrammeValidator = ({
  programme,
  profile,
  exerciseById,
}) => {
  const findings: ProgrammeValidationFinding[] = [];

  programme.phase_week_templates.forEach((template) => {
    const dayFatigue = template.days.map((day) => ({
      day,
      fatigue: dailyFatigue(day, exerciseById),
    }));
    const weeklySystemic = dayFatigue.reduce(
      (total, day) => total + day.fatigue.systemic,
      0,
    );

    if (weeklySystemic > 140) {
      findings.push(
        finding(
          validationCodes.EXCESSIVE_WEEKLY_FATIGUE,
          'warning',
          'fatigue_management',
          'Weekly systemic fatigue is high for a baseline programme.',
          { phase_number: template.phase_number, metadata: { weeklySystemic } },
        ),
      );
    }

    if (
      profile.recovery_capacity === 'low' &&
      dayFatigue.some(
        (day) => day.fatigue.systemic > 28 || day.fatigue.axial > 18,
      )
    ) {
      findings.push(
        finding(
          validationCodes.LOW_RECOVERY_HIGH_FATIGUE,
          'warning',
          'fatigue_management',
          'Low-recovery athlete has a high-fatigue training day.',
          { phase_number: template.phase_number },
        ),
      );
    }
  });

  return findings;
};
