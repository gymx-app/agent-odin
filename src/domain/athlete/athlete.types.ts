import { z } from 'zod';
import { AthleteInputSchema } from './athlete-input.schema.js';
import { NormalizedAthleteProfileSchema } from './normalized-athlete-profile.schema.js';

export type AthleteInput = z.infer<typeof AthleteInputSchema>;
export type NormalizedAthleteProfile = z.infer<
  typeof NormalizedAthleteProfileSchema
>;
