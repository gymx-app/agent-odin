import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { ProgrammeValidationReport } from './validation.types.js';
import { programmeValidationService } from './programme-validation.service.js';

export const validateProgramme = (
  programme: OdinProgramme,
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): ProgrammeValidationReport => {
  return programmeValidationService.validate({
    programme,
    profile,
    exercises,
  });
};

export const applyValidationSummary = (
  programme: OdinProgramme,
  report: ProgrammeValidationReport,
): OdinProgramme => ({
  ...programme,
  validation_summary: {
    passed: report.passed,
    scores: {
      constraint_fit: report.scores.constraint_fit,
      movement_balance: report.scores.movement_balance,
      recovery_fit: report.scores.recovery_fit,
      goal_specificity: report.scores.goal_specificity,
      progression_quality: report.scores.progression_quality,
      session_time_fit: report.scores.session_time_fit,
    },
    warnings: report.findings
      .filter((finding) => finding.severity !== 'info')
      .map((finding) => ({
        code: finding.code,
        severity: finding.severity === 'error' ? 'error' : 'warning',
        message: finding.message,
      })),
  },
});
