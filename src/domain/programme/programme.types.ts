import { z } from 'zod';
import {
  LegacyOdinProgrammeSchema,
  LongitudinalOdinProgrammeSchema,
  OdinProgrammeSchema,
  VersionedLegacyOdinProgrammeSchema,
  VersionedOdinProgrammeSchema,
} from './programme.schema.js';

export type OdinProgramme = z.infer<typeof OdinProgrammeSchema>;
export type LegacyOdinProgramme = z.infer<typeof LegacyOdinProgrammeSchema>;
export type VersionedLegacyOdinProgramme = z.infer<
  typeof VersionedLegacyOdinProgrammeSchema
>;
export type LongitudinalOdinProgramme = z.infer<
  typeof LongitudinalOdinProgrammeSchema
>;
export type VersionedOdinProgramme = z.infer<
  typeof VersionedOdinProgrammeSchema
>;
