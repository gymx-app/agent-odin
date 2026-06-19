import { ExerciseSchema } from '../domain/exercise/exercise.schema.js';
import { NormalizedAthleteProfileSchema } from '../domain/athlete/normalized-athlete-profile.schema.js';
import {
  LegacyOdinProgrammeSchema,
  LongitudinalOdinProgrammeSchema,
  OdinProgrammeSchema,
  VersionedLegacyOdinProgrammeSchema,
} from '../domain/programme/programme.schema.js';
import type {
  LongitudinalOdinProgramme,
  VersionedOdinProgramme,
} from '../domain/programme/programme.types.js';
import { createReport } from './score-calculator.js';
import {
  createValidationContext,
  type ProgrammeValidationInput,
} from './validation-context.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import {
  CURRENT_PROGRAMME_VALIDATION_RULE_VERSION,
  currentProgrammeValidationRuleSet,
} from './programme-validation-rules.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidationReport,
  ProgrammeValidationRuleSet,
  ProgrammeValidationRuleVersion,
} from './validation.types.js';
import { validateLongitudinalCalendar } from './calendar-validator.js';
import {
  LONGITUDINAL_VALIDATION_RULE_VERSION,
  longitudinalValidationRules,
} from './longitudinal-validation-registry.js';
import { calculateLongitudinalMetrics } from './longitudinal-validation-metrics.js';
import { repairProgramme } from '../repair/programme-repair.service.js';

const validateInputs = ({
  programme,
  profile,
  exercises,
}: ProgrammeValidationInput): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];

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

export type VersionedProgrammeValidationInput = Omit<
  ProgrammeValidationInput,
  'programme'
> & {
  programme: VersionedOdinProgramme;
};

const validateLongitudinalProgramme = (
  programme: LongitudinalOdinProgramme,
  profile: ProgrammeValidationInput['profile'],
  exercises: ProgrammeValidationInput['exercises'],
): ProgrammeValidationFinding[] => {
  const parsed = LongitudinalOdinProgrammeSchema.safeParse(programme);

  if (!parsed.success) {
    return parsed.error.issues.map((issue) => {
      const code = issue.message.includes('phase IDs')
        ? validationCodes.DUPLICATE_PHASE_ID
        : issue.message.includes('week days')
          ? validationCodes.INVALID_CALENDAR_REFERENCE
          : issue.message.includes('progression_rule_id') ||
              issue.message.includes('progression_policy_id')
            ? validationCodes.INVALID_POLICY_REFERENCE
            : validationCodes.LONGITUDINAL_SCHEMA_INVALID;
      return finding(code, 'error', 'structure', issue.message, {
        metadata: { path: issue.path },
      });
    });
  }

  const findings: ProgrammeValidationFinding[] = [];
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );

  parsed.data.phases
    .flatMap((phase) => phase.weeks)
    .flatMap((week) => week.days)
    .forEach((day) => {
      day.exercises.forEach((prescription) => {
        const approved = exerciseById.get(prescription.exercise_id);
        if (!approved) {
          findings.push(
            finding(
              validationCodes.LONGITUDINAL_EXERCISE_UNKNOWN,
              'error',
              'exercise_integrity',
              'Longitudinal prescription references an unknown exercise ID.',
              { exercise_id: prescription.exercise_id },
            ),
          );
        } else if (approved.name !== prescription.exercise_name) {
          findings.push(
            finding(
              validationCodes.LONGITUDINAL_EXERCISE_NAME_MISMATCH,
              'error',
              'naming_quality',
              'Longitudinal exercise name does not match the approved library.',
              { exercise_id: prescription.exercise_id },
            ),
          );
        }
      });
      day.conditioning
        .filter((item) => item.interference_risk === 'unacceptable')
        .forEach((item) => {
          findings.push(
            finding(
              validationCodes.LONGITUDINAL_INTERFERENCE_UNACCEPTABLE,
              'error',
              'recovery_fit',
              'Conditioning prescription has unacceptable interference risk.',
              { metadata: { conditioning_id: item.conditioning_id } },
            ),
          );
        });
    });

  findings.push(
    ...longitudinalValidationRules.flatMap((rule) =>
      rule.validate(parsed.data, profile, exercises),
    ),
  );

  return findings;
};

export class ProgrammeValidationService {
  private readonly ruleSetsByVersion: ReadonlyMap<
    ProgrammeValidationRuleVersion,
    ProgrammeValidationRuleSet
  >;

  constructor(
    ruleSets: readonly ProgrammeValidationRuleSet[] = [
      currentProgrammeValidationRuleSet,
    ],
  ) {
    this.ruleSetsByVersion = new Map(
      ruleSets.map((ruleSet) => [ruleSet.version, ruleSet]),
    );
  }

  validate(
    input: ProgrammeValidationInput,
    ruleVersion: ProgrammeValidationRuleVersion = CURRENT_PROGRAMME_VALIDATION_RULE_VERSION,
  ): ProgrammeValidationReport {
    const ruleSet = this.ruleSetsByVersion.get(ruleVersion);

    if (!ruleSet) {
      throw new Error(
        `Programme validation rule version "${ruleVersion}" is not registered.`,
      );
    }

    const context = createValidationContext(input);
    const findings = [
      ...validateInputs(input),
      ...ruleSet.rules.flatMap((registeredRule) =>
        registeredRule.validate(context),
      ),
    ];

    return {
      ...createReport(findings),
      findings,
    };
  }

  validateVersioned(
    input: VersionedProgrammeValidationInput,
  ): ProgrammeValidationReport {
    if (input.programme.schema_version === '1.0') {
      const versioned = VersionedLegacyOdinProgrammeSchema.parse(
        input.programme,
      );
      const programme = LegacyOdinProgrammeSchema.parse(versioned);
      return this.validate({ ...input, programme });
    }

    if (input.programme.planner_version !== 'longitudinal_v1') {
      const findings = [
        finding(
          validationCodes.UNSUPPORTED_PLANNER_VERSION,
          'error',
          'structure',
          'Programme planner version is not supported.',
        ),
      ];
      return { ...createReport(findings), findings };
    }

    const findings = validateLongitudinalProgramme(
      input.programme,
      input.profile,
      input.exercises,
    );

    const report: ProgrammeValidationReport = {
      ...createReport(findings),
      findings,
      metrics: calculateLongitudinalMetrics(input.programme, findings),
      evaluated_rule_versions: longitudinalValidationRules.map((rule) => ({
        rule_id: rule.id,
        version: rule.version,
      })),
      repair: {
        attempted: false,
        applied: false,
        operation_count: 0,
        operations: [],
      },
    };
    return report;
  }

  validateAndRepairVersioned(input: VersionedProgrammeValidationInput): {
    programme: VersionedOdinProgramme;
    validation: ProgrammeValidationReport;
  } {
    const initial = this.validateVersioned(input);
    if (input.programme.schema_version === '1.0' || initial.passed) {
      return { programme: input.programme, validation: initial };
    }
    const repaired = repairProgramme({
      programme: input.programme,
      profile: input.profile,
      exercises: input.exercises,
      validation: initial,
    });
    if (!repaired.applied) {
      return {
        programme: input.programme,
        validation: {
          ...initial,
          repair: {
            attempted: repaired.attempted,
            applied: false,
            operation_count: repaired.operations.length,
            operations: repaired.operations,
            ...(repaired.rejection_reason
              ? { rejection_reason: repaired.rejection_reason }
              : {}),
          },
        },
      };
    }
    const revalidated = this.validateVersioned({
      ...input,
      programme: repaired.programme,
    });
    const accepted =
      revalidated.passed &&
      revalidated.summary.error_count <= initial.summary.error_count &&
      revalidated.overall_score >= initial.overall_score;
    return {
      programme: accepted ? repaired.programme : input.programme,
      validation: {
        ...(accepted ? revalidated : initial),
        repair: {
          attempted: true,
          applied: accepted,
          operation_count: repaired.operations.length,
          operations: repaired.operations,
          ...(!accepted
            ? { rejection_reason: 'FULL_REVALIDATION_FAILED' }
            : {}),
        },
      },
    };
  }
}

export const programmeValidationService = new ProgrammeValidationService();
