import { validateAthleteConstraints } from './athlete-constraint-validator.js';
import { validateDuration } from './duration-validator.js';
import { validateExerciseReferences } from './exercise-reference-validator.js';
import { validateFatigue } from './fatigue-validator.js';
import { validateGoalSpecificity } from './goal-specificity-validator.js';
import { validateMovementBalance } from './movement-balance-validator.js';
import { validateNaming } from './naming-validator.js';
import { validatePrescriptions } from './prescription-validator.js';
import { validateProgression } from './progression-validator.js';
import { validateRecovery } from './recovery-validator.js';
import { validateStructure } from './structural-validator.js';
import type {
  ProgrammeValidationRuleSet,
  RegisteredProgrammeValidationRule,
} from './validation.types.js';

export const CURRENT_PROGRAMME_VALIDATION_RULE_VERSION =
  'programme-validation/v1' as const;

const rule = (
  id: string,
  validate: RegisteredProgrammeValidationRule['validate'],
): RegisteredProgrammeValidationRule => ({
  id,
  version: 1,
  validate,
});

export const currentProgrammeValidationRules = [
  rule('structure', validateStructure),
  rule('exercise-references', validateExerciseReferences),
  rule('athlete-constraints', validateAthleteConstraints),
  rule('prescriptions', validatePrescriptions),
  rule('progression', validateProgression),
  rule('duration', validateDuration),
  rule('movement-balance', validateMovementBalance),
  rule('fatigue', validateFatigue),
  rule('recovery', validateRecovery),
  rule('goal-specificity', validateGoalSpecificity),
  rule('naming', validateNaming),
] as const;

export const currentProgrammeValidationRuleSet: ProgrammeValidationRuleSet = {
  version: CURRENT_PROGRAMME_VALIDATION_RULE_VERSION,
  rules: currentProgrammeValidationRules,
};
