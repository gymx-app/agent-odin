import type {
  ProgrammeValidationFinding,
  ProgrammeValidationReport,
  ProgrammeValidationScores,
  ValidationCategory,
} from './validation.types.js';
import { validationCodes, type ValidationCode } from './validation-codes.js';

const categories: ValidationCategory[] = [
  'structure',
  'constraint_fit',
  'exercise_integrity',
  'movement_balance',
  'recovery_fit',
  'fatigue_management',
  'goal_specificity',
  'progression_quality',
  'session_time_fit',
  'prescription_quality',
  'naming_quality',
];

const weights: Record<ValidationCategory, number> = {
  constraint_fit: 0.15,
  prescription_quality: 0.15,
  recovery_fit: 0.12,
  fatigue_management: 0.12,
  movement_balance: 0.1,
  goal_specificity: 0.1,
  progression_quality: 0.1,
  session_time_fit: 0.08,
  exercise_integrity: 0.05,
  structure: 0.02,
  naming_quality: 0.01,
};

const penaltyBySeverity = {
  info: 1,
  warning: 10,
  error: 35,
};

const criticalCodes = new Set<ValidationCode>([
  validationCodes.PROGRAMME_SCHEMA_INVALID,
  validationCodes.PHASE_COUNT_MISMATCH,
  validationCodes.WEEK_TEMPLATE_COUNT_MISMATCH,
  validationCodes.UNKNOWN_EXERCISE_ID,
  validationCodes.DEPRECATED_EXERCISE_USED,
  validationCodes.EQUIPMENT_UNAVAILABLE,
  validationCodes.EXCLUDED_EXERCISE_USED,
  validationCodes.AVOID_RESTRICTION_VIOLATION,
  validationCodes.INVALID_SET_TARGET,
  validationCodes.INVALID_RPE_TARGET,
  validationCodes.INVALID_REST_TARGET,
  validationCodes.INVALID_PROGRESSION_BOUNDS,
  validationCodes.SPECIFIC_WEIGHT_PRESCRIBED,
  validationCodes.WORKOUT_DURATION_EXCEEDED,
]);

const clampScore = (score: number): number =>
  Math.min(100, Math.max(0, Math.round(score)));

export const calculateScores = (
  findings: ProgrammeValidationFinding[],
): ProgrammeValidationScores => {
  const scores = Object.fromEntries(
    categories.map((category) => [category, 100]),
  ) as ProgrammeValidationScores;

  findings.forEach((finding) => {
    if (criticalCodes.has(finding.code)) {
      scores[finding.category] = 0;
      return;
    }

    scores[finding.category] = clampScore(
      scores[finding.category] - penaltyBySeverity[finding.severity],
    );
  });

  return scores;
};

export const calculateOverallScore = (
  scores: ProgrammeValidationScores,
): number =>
  clampScore(
    categories.reduce(
      (total, category) => total + scores[category] * weights[category],
      0,
    ),
  );

export const createReport = (
  findings: ProgrammeValidationFinding[],
): Pick<
  ProgrammeValidationReport,
  'passed' | 'status' | 'overall_score' | 'scores' | 'summary'
> => {
  const errorCount = findings.filter(
    (finding) => finding.severity === 'error',
  ).length;
  const warningCount = findings.filter(
    (finding) => finding.severity === 'warning',
  ).length;
  const infoCount = findings.filter(
    (finding) => finding.severity === 'info',
  ).length;
  const scores = calculateScores(findings);
  const status =
    errorCount > 0 ? 'fail' : warningCount > 0 ? 'pass_with_warnings' : 'pass';

  return {
    passed: status !== 'fail',
    status,
    overall_score: calculateOverallScore(scores),
    scores,
    summary: {
      error_count: errorCount,
      warning_count: warningCount,
      info_count: infoCount,
    },
  };
};
