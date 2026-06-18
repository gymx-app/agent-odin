import type { SavedProgramme } from '../../repositories/repository.types.js';
import { odinError } from '../../shared/errors/odin-errors.js';

export type CurrentDraftReader = {
  getCurrentDraft: (userId: string) => Promise<SavedProgramme | null>;
};

export const getCurrentDraft = async (
  userId: string,
  repository: CurrentDraftReader,
): Promise<SavedProgramme> => {
  const saved = await repository.getCurrentDraft(userId);

  if (!saved) {
    throw odinError(
      'CURRENT_PROGRAMME_NOT_FOUND',
      'Current draft programme was not found.',
      404,
    );
  }

  return saved;
};
