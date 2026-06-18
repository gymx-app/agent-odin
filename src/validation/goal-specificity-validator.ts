import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

const calorieBurnGuaranteePattern =
  /(burn|burns|burned|burning)\s+\d+\s*(?:kcal|calorie|calories)|\d+\s*(?:kcal|calorie|calories)\s+(?:burn|burned|burnt)/i;

export const validateGoalSpecificity: ProgrammeValidator = ({
  programme,
  profile,
}) => {
  const workoutCount =
    programme.phase_week_templates[0]?.days.filter(
      (day) => day.workout_type === 'workout',
    ).length ?? 0;
  const lissCount =
    programme.phase_week_templates[0]?.days.filter(
      (day) => day.workout_type === 'liss',
    ).length ?? 0;
  const findings: ProgrammeValidationFinding[] = [];

  if (profile.source.goal === 'fat_loss' && workoutCount < 2) {
    findings.push(
      finding(
        validationCodes.GOAL_STRUCTURE_MISMATCH,
        'error',
        'goal_specificity',
        'Fat-loss programme must retain resistance training.',
      ),
    );
  }

  if (profile.source.goal === 'muscle_gain' && lissCount > workoutCount) {
    findings.push(
      finding(
        validationCodes.GOAL_STRUCTURE_MISMATCH,
        'warning',
        'goal_specificity',
        'LISS should not dominate a muscle-gain programme.',
      ),
    );
  }

  if (profile.source.goal === 'endurance' && workoutCount < 2) {
    findings.push(
      finding(
        validationCodes.GOAL_STRUCTURE_MISMATCH,
        'warning',
        'goal_specificity',
        'Endurance programme should retain at least two resistance sessions when availability allows.',
      ),
    );
  }

  if (calorieBurnGuaranteePattern.test(JSON.stringify(programme))) {
    findings.push(
      finding(
        validationCodes.GOAL_STRUCTURE_MISMATCH,
        'error',
        'goal_specificity',
        'Programme must not include calorie-burn guarantees.',
      ),
    );
  }

  return findings;
};
