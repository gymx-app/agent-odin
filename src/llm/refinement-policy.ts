import type { ProgrammeValidationReport } from '../validation/validation.types.js';

export type ValidationComparison = {
  accepted: boolean;
  reasonCode: string | null;
};

const hardCategories = [
  'constraint_fit',
  'exercise_integrity',
  'prescription_quality',
  'session_time_fit',
] as const;

export const compareProgrammeValidation = (
  baseline: ProgrammeValidationReport,
  refined: ProgrammeValidationReport,
): ValidationComparison => {
  if (!refined.passed || refined.status === 'fail') {
    return { accepted: false, reasonCode: 'REFINEMENT_VALIDATION_REJECTED' };
  }

  if (refined.summary.error_count > baseline.summary.error_count) {
    return { accepted: false, reasonCode: 'REFINEMENT_VALIDATION_REJECTED' };
  }

  if (
    hardCategories.some(
      (category) => refined.scores[category] < baseline.scores[category],
    )
  ) {
    return { accepted: false, reasonCode: 'REFINEMENT_SCORE_REJECTED' };
  }

  if (refined.scores.naming_quality < baseline.scores.naming_quality) {
    return { accepted: false, reasonCode: 'REFINEMENT_SCORE_REJECTED' };
  }

  if (
    baseline.scores.constraint_fit === 100 &&
    refined.scores.constraint_fit !== 100
  ) {
    return { accepted: false, reasonCode: 'REFINEMENT_SCORE_REJECTED' };
  }

  if (refined.overall_score < baseline.overall_score - 2) {
    return { accepted: false, reasonCode: 'REFINEMENT_SCORE_REJECTED' };
  }

  return { accepted: true, reasonCode: null };
};
