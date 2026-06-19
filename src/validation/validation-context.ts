import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../domain/programme/programme.types.js';
import type { ValidatorContext } from './validation.types.js';

export type ProgrammeValidationInput = {
  programme: OdinProgramme;
  profile: NormalizedAthleteProfile;
  exercises: Exercise[];
};

export const createValidationContext = ({
  programme,
  profile,
  exercises,
}: ProgrammeValidationInput): ValidatorContext => ({
  programme,
  profile,
  exercises,
  exerciseById: new Map(exercises.map((exercise) => [exercise.id, exercise])),
});
