import type { AthleteInput } from './athlete.types.js';
import type { AthleteInputV2 } from './athlete-input-v2.schema.js';

// v2 request bodies use `injuries[].modification`; normalizeAthlete (and the
// rest of the base pipeline) reads `injuries[].severity`. Mirrors the inline
// remap in api/odin/generate-programme-v2.ts so every v2 endpoint that calls
// normalizeAthlete maps injuries the same way.
export const mapAthleteInputV2ToBase = (athlete: AthleteInputV2): AthleteInput => ({
  ...(athlete as unknown as AthleteInput),
  injuries: athlete.injuries.map((injury) => ({
    area: injury.area,
    severity: injury.modification,
    notes: injury.notes ?? '',
  })),
});
