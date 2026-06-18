import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import { NormalizedAthleteProfileSchema } from '../domain/athlete/normalized-athlete-profile.schema.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import { OdinProgrammeSchema } from '../domain/programme/programme.schema.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { ExerciseSchema } from '../domain/exercise/exercise.schema.js';
import { validateStructure } from './structural-validator.js';
import { validateExerciseReferences } from './exercise-reference-validator.js';
import { validateAthleteConstraints } from './athlete-constraint-validator.js';
import { validatePrescriptions } from './prescription-validator.js';
import { validateProgression } from './progression-validator.js';
import { validateDuration } from './duration-validator.js';
import { validateMovementBalance } from './movement-balance-validator.js';
import { validateFatigue } from './fatigue-validator.js';
import { validateRecovery } from './recovery-validator.js';
import { validateGoalSpecificity } from './goal-specificity-validator.js';
import { validateNaming } from './naming-validator.js';
import { createReport } from './score-calculator.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidationReport,
  ProgrammeValidator,
  ValidatorContext,
} from './validation.types.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';

const validators: ProgrammeValidator[] = [
  validateStructure,
  validateExerciseReferences,
  validateAthleteConstraints,
  validatePrescriptions,
  validateProgression,
  validateDuration,
  validateMovementBalance,
  validateFatigue,
  validateRecovery,
  validateGoalSpecificity,
  validateNaming,
];

const inputFindings = (
  programme: OdinProgramme,
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): ProgrammeValidationFinding[] => {
  const findings = [];

  if (!OdinProgrammeSchema.safeParse(programme).success) {
    findings.push(
      finding(
        validationCodes.PROGRAMME_SCHEMA_INVALID,
        'error',
        'structure',
        'Programme input is not schema-valid.',
      ),
    );
  }

  if (!NormalizedAthleteProfileSchema.safeParse(profile).success) {
    findings.push(
      finding(
        validationCodes.PROGRAMME_SCHEMA_INVALID,
        'error',
        'constraint_fit',
        'Normalized athlete profile input is not schema-valid.',
      ),
    );
  }

  exercises.forEach((exercise) => {
    if (!ExerciseSchema.safeParse(exercise).success) {
      findings.push(
        finding(
          validationCodes.INVALID_EXERCISE_METADATA,
          'error',
          'exercise_integrity',
          'Approved exercise library contains an invalid exercise.',
          { exercise_id: exercise.id },
        ),
      );
    }
  });

  return findings;
};

export const validateProgramme = (
  programme: OdinProgramme,
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): ProgrammeValidationReport => {
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const context: ValidatorContext = {
    programme,
    profile,
    exercises,
    exerciseById,
  };
  const findings = [
    ...inputFindings(programme, profile, exercises),
    ...validators.flatMap((validator) => validator(context)),
  ];
  const reportBase = createReport(findings);

  return {
    ...reportBase,
    findings,
  };
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
