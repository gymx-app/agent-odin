import { z } from 'zod';
import { OdinProgrammeSchema } from './programme.schema.js';

export type OdinProgramme = z.infer<typeof OdinProgrammeSchema>;
