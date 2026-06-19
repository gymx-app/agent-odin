import type { ProgrammeValidationReport } from '../validation/validation.types.js';

export type V2ValidationComparison = {
  accepted: boolean;
  reasonCode: string | null;
};

const hardCategories = [
  'constraint_fit',
  'exercise_integrity',
  'prescription_quality',
  'session_time_fit',
] as const;

export const compareV2ProgrammeValidation = (
  baseline: ProgrammeValidationReport,
  refined: ProgrammeValidationReport,
): V2ValidationComparison => {
  if (!refined.passed || refined.status === 'fail') {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_VALIDATION_REJECTED' };
  }

  if (refined.summary.error_count > baseline.summary.error_count) {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_ERROR_COUNT_WORSE' };
  }

  const baselineSevereWarnings = baseline.findings.filter(
    (finding) => finding.severity === 'warning',
  ).length;
  const refinedSevereWarnings = refined.findings.filter(
    (finding) => finding.severity === 'warning',
  ).length;
  if (refinedSevereWarnings > baselineSevereWarnings) {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_NEW_WARNING' };
  }

  if (
    hardCategories.some(
      (category) => refined.scores[category] < baseline.scores[category],
    )
  ) {
    return {
      accepted: false,
      reasonCode: 'V2_REFINEMENT_HARD_CATEGORY_DEGRADED',
    };
  }

  if (
    baseline.scores.constraint_fit === 100 &&
    refined.scores.constraint_fit !== 100
  ) {
    return {
      accepted: false,
      reasonCode: 'V2_REFINEMENT_CONSTRAINT_FIT_LOST',
    };
  }

  const baselineDurationFindings = baseline.findings.filter(
    (finding) => finding.category === 'session_time_fit',
  ).length;
  const refinedDurationFindings = refined.findings.filter(
    (finding) => finding.category === 'session_time_fit',
  ).length;
  if (refinedDurationFindings > baselineDurationFindings) {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_DURATION_WORSE' };
  }

  const baselineInterferenceFindings = baseline.findings.filter(
    (finding) =>
      finding.code.includes('INTERFERENCE') ||
      finding.code.includes('interference'),
  ).length;
  const refinedInterferenceFindings = refined.findings.filter(
    (finding) =>
      finding.code.includes('INTERFERENCE') ||
      finding.code.includes('interference'),
  ).length;
  if (refinedInterferenceFindings > baselineInterferenceFindings) {
    return {
      accepted: false,
      reasonCode: 'V2_REFINEMENT_INTERFERENCE_WORSE',
    };
  }

  const baselineCoherence = baseline.findings.filter(
    (finding) =>
      finding.category === 'movement_balance' ||
      finding.category === 'recovery_fit' ||
      finding.category === 'fatigue_management',
  ).length;
  const refinedCoherence = refined.findings.filter(
    (finding) =>
      finding.category === 'movement_balance' ||
      finding.category === 'recovery_fit' ||
      finding.category === 'fatigue_management',
  ).length;
  if (refinedCoherence > baselineCoherence) {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_COHERENCE_WORSE' };
  }

  if (refined.overall_score < baseline.overall_score) {
    return { accepted: false, reasonCode: 'V2_REFINEMENT_SCORE_WORSE' };
  }

  if (refined.scores.naming_quality < baseline.scores.naming_quality) {
    return {
      accepted: false,
      reasonCode: 'V2_REFINEMENT_NAMING_QUALITY_DEGRADED',
    };
  }

  return { accepted: true, reasonCode: null };
};
