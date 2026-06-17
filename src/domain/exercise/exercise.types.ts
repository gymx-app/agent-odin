import { z } from 'zod';
import { ExerciseSchema, MovementDemandsSchema } from './exercise.schema.js';

export type Exercise = z.infer<typeof ExerciseSchema>;
export type MovementDemands = z.infer<typeof MovementDemandsSchema>;
