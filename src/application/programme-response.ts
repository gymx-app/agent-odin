import type { SavedProgramme } from '../repositories/repository.types.js';

export const programmeResponseData = (saved: SavedProgramme) => ({
  programme_id: saved.id,
  version: saved.version,
  status: saved.status,
  source: saved.source,
  programme: saved.programme,
  validation: saved.validation,
  refinement: saved.refinement,
});
