import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidator,
} from './validation.types.js';

const pushPatterns = ['horizontal_push', 'vertical_push'];
const pullPatterns = ['horizontal_pull', 'vertical_pull'];

const countSetsForPatterns = (
  patterns: string[],
  template: Parameters<ProgrammeValidator>[0]['programme']['phase_week_templates'][number],
): number =>
  template.days.reduce(
    (total, day) =>
      total +
      day.exercises.reduce((dayTotal, exercise) => {
        const matches = exercise.movement_patterns.some((pattern) =>
          patterns.includes(pattern),
        );

        return dayTotal + (matches ? exercise.sets.length : 0);
      }, 0),
    0,
  );

export const validateMovementBalance: ProgrammeValidator = ({ programme }) => {
  const findings: ProgrammeValidationFinding[] = [];

  programme.phase_week_templates.forEach((template) => {
    const allPatterns = template.days.flatMap((day) =>
      day.exercises.flatMap((exercise) => exercise.movement_patterns),
    );

    const hasLowerBody =
      allPatterns.includes('squat') ||
      allPatterns.includes('knee_extension_isolation');
    const hasHinge =
      allPatterns.includes('hinge') ||
      allPatterns.includes('knee_flexion_isolation');
    const hasPush = allPatterns.some((pattern) =>
      pushPatterns.includes(pattern),
    );
    const hasPull = allPatterns.some((pattern) =>
      pullPatterns.includes(pattern),
    );
    const hasCore = allPatterns.some((pattern) => pattern.startsWith('core_'));

    [
      ['lower-body pattern', hasLowerBody],
      ['hinge or posterior-chain pattern', hasHinge],
      ['push pattern', hasPush],
      ['pull pattern', hasPull],
      ['core pattern', hasCore],
    ].forEach(([label, present]) => {
      if (!present) {
        findings.push(
          finding(
            validationCodes.REQUIRED_PATTERN_MISSING,
            'warning',
            'movement_balance',
            `Weekly template is missing ${label}.`,
            { phase_number: template.phase_number },
          ),
        );
      }
    });

    const pushSets = countSetsForPatterns(pushPatterns, template);
    const pullSets = countSetsForPatterns(pullPatterns, template);
    const larger = Math.max(pushSets, pullSets);
    const differenceRatio =
      larger === 0 ? 0 : Math.abs(pushSets - pullSets) / larger;

    if (differenceRatio > 0.35) {
      findings.push(
        finding(
          validationCodes.PUSH_PULL_IMBALANCE,
          'error',
          'movement_balance',
          'Weekly push and pull set exposure differs by more than 35%.',
          {
            phase_number: template.phase_number,
            metadata: { pushSets, pullSets },
          },
        ),
      );
    } else if (differenceRatio > 0.2) {
      findings.push(
        finding(
          validationCodes.PUSH_PULL_IMBALANCE,
          'warning',
          'movement_balance',
          'Weekly push and pull set exposure differs by more than 20%.',
          {
            phase_number: template.phase_number,
            metadata: { pushSets, pullSets },
          },
        ),
      );
    }
  });

  return findings;
};
