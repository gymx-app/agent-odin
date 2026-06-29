import { validateLongitudinalCalendar } from './calendar-validator.js';
import { validateLongitudinalConditioning } from './conditioning-validator.js';
import { validateLongitudinalExerciseSequences } from './exercise-sequence-validator.js';
import { validateLongitudinalPhases } from './phase-validator.js';
import { validateProgrammeCoherence } from './programme-coherence-validator.js';
import { validateLongitudinalSessions } from './session-validator.js';
import { validateLongitudinalStrategy } from './strategy-validator.js';
import { validateLongitudinalCooldowns } from './cooldown-validator.js';
import { validateLongitudinalWarmups } from './warmup-validator.js';
import { validateLongitudinalWeeks } from './week-validator.js';
import type { LongitudinalValidationRule } from './validation.types.js';

export const LONGITUDINAL_VALIDATION_RULE_VERSION =
  'programme-validation/v2' as const;

export const longitudinalValidationRules: readonly LongitudinalValidationRule[] =
  [
    {
      id: 'calendar',
      version: 2,
      validate: (programme, profile) =>
        validateLongitudinalCalendar(
          programme.calendar,
          programme.strategy,
          profile,
        ),
    },
    {
      id: 'strategy',
      version: 2,
      validate: (programme, profile) =>
        validateLongitudinalStrategy(
          programme.strategy,
          programme.calendar,
          profile,
        ),
    },
    { id: 'phases', version: 2, validate: validateLongitudinalPhases },
    { id: 'weeks', version: 2, validate: validateLongitudinalWeeks },
    { id: 'sessions', version: 2, validate: validateLongitudinalSessions },
    { id: 'warmups', version: 2, validate: validateLongitudinalWarmups },
    {
      id: 'cooldowns',
      version: 2,
      validate: validateLongitudinalCooldowns,
    },
    {
      id: 'exercise-sequencing',
      version: 2,
      validate: (programme, _profile, exercises) =>
        validateLongitudinalExerciseSequences(programme, exercises),
    },
    {
      id: 'conditioning',
      version: 2,
      validate: validateLongitudinalConditioning,
    },
    {
      id: 'programme-coherence',
      version: 1,
      validate: validateProgrammeCoherence,
    },
  ];
