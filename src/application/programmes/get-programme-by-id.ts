import type { SavedProgramme } from '../../repositories/repository.types.js';
import { odinError } from '../../shared/errors/odin-errors.js';

export type ProgrammeByIdReader = {
  getById: (
    userId: string,
    programmeId: string,
  ) => Promise<SavedProgramme | null>;
};

export const getProgrammeById = async (
  userId: string,
  programmeId: string,
  repository: ProgrammeByIdReader,
): Promise<SavedProgramme> => {
  const saved = await repository.getById(userId, programmeId);

  if (!saved) {
    throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
  }

  return saved;
};
