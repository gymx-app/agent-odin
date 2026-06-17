import { z } from 'zod';
import { AthleteInputSchema } from './athlete-input.schema.js';
import {
  FitnessLevelSchema,
  HealthFlagSeveritySchema,
  ProgrammeConfidenceSchema,
  RecoveryCapacitySchema,
} from '../shared/domain-enums.js';
import { MovementDemandTagSchema } from '../exercise/exercise-taxonomy.js';

const HealthFlagSchema = z.object({
  code: z.string(),
  severity: HealthFlagSeveritySchema,
  message: z.string(),
});

const MovementRestrictionSchema = z.object({
  tag: MovementDemandTagSchema,
  severity: z.enum(['modify', 'avoid']),
  source_area: z.string().trim().min(1),
  notes: z.string(),
});

export const NormalizedAthleteProfileSchema = z.object({
  source: AthleteInputSchema,
  training_age_category: FitnessLevelSchema,
  weekly_training_minutes: z.number().int().positive(),
  programme_horizon_weeks: z.number().int().min(2).max(52),
  recovery_capacity: RecoveryCapacitySchema,
  movement_restrictions: z.array(MovementRestrictionSchema),
  restricted_movement_tags: z.array(z.string()),
  excluded_exercise_ids: z.array(z.string()),
  health_flags: z.array(HealthFlagSchema),
  assumptions: z.array(z.string()),
  programme_confidence: ProgrammeConfidenceSchema,
});
