import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import {
  ProgrammeValidationService,
  programmeValidationService,
} from '../../src/validation/programme-validation.service.js';
import {
  CURRENT_PROGRAMME_VALIDATION_RULE_VERSION,
  currentProgrammeValidationRules,
  currentProgrammeValidationRuleSet,
} from '../../src/validation/programme-validation-rules.js';
import { createValidationContext } from '../../src/validation/validation-context.js';
import { validateProgramme } from '../../src/validation/programme-validator.js';
import { createProfile } from '../planning/test-planning-utils.js';

describe('ProgrammeValidationService', () => {
  it('preserves the validateProgramme compatibility result and shape', () => {
    const profile = createProfile({
      equipment: 'full_gym',
      available_days_per_week: 3,
      session_duration_min: 60,
    });
    const programme = buildBaselineProgramme(profile, seedExercises);
    const input = { programme, profile, exercises: seedExercises };

    const serviceReport = programmeValidationService.validate(input);
    const compatibilityReport = validateProgramme(
      programme,
      profile,
      seedExercises,
    );

    expect(serviceReport).toStrictEqual(compatibilityReport);
    expect(Object.keys(serviceReport).sort()).toEqual([
      'findings',
      'overall_score',
      'passed',
      'scores',
      'status',
      'summary',
    ]);
    expect(serviceReport).not.toHaveProperty('rule_version');
  });

  it('creates the shared lookup context once for registered rules', () => {
    const profile = createProfile({ equipment: 'full_gym' });
    const programme = buildBaselineProgramme(profile, seedExercises);
    const context = createValidationContext({
      programme,
      profile,
      exercises: seedExercises,
    });

    expect(context.exerciseById.size).toBe(seedExercises.length);
    seedExercises.forEach((exercise) => {
      expect(context.exerciseById.get(exercise.id)).toBe(exercise);
    });
  });

  it('selects an explicitly registered validation rule version', () => {
    const profile = createProfile({ equipment: 'full_gym' });
    const programme = buildBaselineProgramme(profile, seedExercises);
    const service = new ProgrammeValidationService([
      currentProgrammeValidationRuleSet,
    ]);

    expect(
      service.validate(
        { programme, profile, exercises: seedExercises },
        CURRENT_PROGRAMME_VALIDATION_RULE_VERSION,
      ),
    ).toStrictEqual(validateProgramme(programme, profile, seedExercises));
  });

  it('keeps the current rule IDs, versions, and execution order explicit', () => {
    expect(CURRENT_PROGRAMME_VALIDATION_RULE_VERSION).toBe(
      'programme-validation/v1',
    );
    expect(
      currentProgrammeValidationRules.map(({ id, version }) => ({
        id,
        version,
      })),
    ).toEqual([
      { id: 'structure', version: 1 },
      { id: 'exercise-references', version: 1 },
      { id: 'athlete-constraints', version: 1 },
      { id: 'prescriptions', version: 1 },
      { id: 'progression', version: 1 },
      { id: 'duration', version: 1 },
      { id: 'movement-balance', version: 1 },
      { id: 'fatigue', version: 1 },
      { id: 'recovery', version: 1 },
      { id: 'goal-specificity', version: 1 },
      { id: 'naming', version: 1 },
    ]);
  });

  it('rejects an unregistered validation rule version', () => {
    const profile = createProfile({ equipment: 'full_gym' });
    const programme = buildBaselineProgramme(profile, seedExercises);

    expect(() =>
      programmeValidationService.validate(
        { programme, profile, exercises: seedExercises },
        'programme-validation/v999',
      ),
    ).toThrow('is not registered');
  });
});
