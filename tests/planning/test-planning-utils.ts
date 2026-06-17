import type { NormalizedAthleteProfile } from '../../src/domain/athlete/athlete.types.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from '../normalization/test-athletes.js';

export const createProfile = (patch = {}): NormalizedAthleteProfile =>
  normalizeAthlete(createAthlete(patch));

export const workoutDays = (
  programme: import('../../src/domain/programme/programme.types.js').OdinProgramme,
) =>
  programme.phase_week_templates[0]!.days.filter(
    (day) => day.workout_type === 'workout',
  );

export const lissDays = (
  programme: import('../../src/domain/programme/programme.types.js').OdinProgramme,
) =>
  programme.phase_week_templates[0]!.days.filter(
    (day) => day.workout_type === 'liss',
  );
