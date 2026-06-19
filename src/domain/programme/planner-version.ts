import { z } from 'zod';

export const PlannerVersionSchema = z.enum(['legacy_v1', 'longitudinal_v1']);

export type PlannerVersion = z.infer<typeof PlannerVersionSchema>;
