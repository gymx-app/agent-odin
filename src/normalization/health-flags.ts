import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { HealthFlag, WeightChangeResult } from './normalization.types.js';

export const createHealthFlags = (
  input: AthleteInput,
  weightChange: WeightChangeResult,
  weeklyTrainingMinutes: number,
): HealthFlag[] => {
  const flags: HealthFlag[] = [];

  if (input.inbody !== null) {
    if (input.inbody.visceral_fat_area > 100) {
      flags.push({
        code: 'ELEVATED_VISCERAL_FAT',
        severity: 'warning',
        message:
          'InBody visceral fat area is elevated and should be treated as health-priority context.',
      });
    }

    if (input.inbody.body_fat_pct > 70) {
      flags.push({
        code: 'IMPLAUSIBLE_BODY_FAT',
        severity: 'blocking',
        message:
          'InBody body fat percentage is implausibly high for automated planning.',
      });
    }
  }

  if (input.goal === 'fat_loss' && weightChange.direction === 'gain') {
    flags.push({
      code: 'GOAL_TARGET_DIRECTION_MISMATCH',
      severity: 'warning',
      message: 'Fat-loss goal has a target weight above current weight.',
    });
  }

  if (input.goal === 'muscle_gain' && weightChange.direction === 'loss') {
    flags.push({
      code: 'GOAL_TARGET_DIRECTION_MISMATCH',
      severity: 'warning',
      message: 'Muscle-gain goal has a target weight below current weight.',
    });
  }

  if (weightChange.percentage_change_from_start >= 20) {
    flags.push({
      code: 'LARGE_WEIGHT_CHANGE_REQUEST',
      severity: 'warning',
      message:
        'Requested target weight change is large and may require adjusted expectations.',
    });
  }

  if (weeklyTrainingMinutes < 60) {
    flags.push({
      code: 'LOW_TRAINING_AVAILABILITY',
      severity: 'warning',
      message:
        'Weekly training time is below 60 minutes and may not strongly support the selected goal.',
    });
  }

  return flags;
};
