import { z } from 'zod';
import { AthleteInputSchema } from './athlete-input.schema.js';
import {
  DerivedStateConfidenceSchema,
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
  source_fields: z.array(z.string()).optional(),
  clinician_restriction: z.boolean().optional(),
});

const derivedState = <Schema extends z.ZodTypeAny>(value: Schema) =>
  z.object({
    value,
    reason_codes: z.array(z.string().trim().min(1)),
    source_fields: z.array(z.string().trim().min(1)),
    confidence: DerivedStateConfidenceSchema,
  });

const AthleteStateSchema = z.object({
  training_status: derivedState(
    z.enum(['beginner', 'intermediate', 'advanced', 'returning', 'unknown']),
  ),
  schedule_capacity: derivedState(
    z.enum(['limited', 'standard', 'flexible', 'unknown']),
  ),
  recovery_capacity: derivedState(RecoveryCapacitySchema),
  movement_limitation_level: derivedState(
    z.enum(['none', 'moderate', 'high', 'unknown']),
  ),
  energy_availability: derivedState(
    z.enum(['deficit', 'maintenance', 'surplus', 'unknown']),
  ),
  protein_adequacy: derivedState(
    z.enum(['likely_inadequate', 'uncertain', 'likely_adequate', 'unknown']),
  ),
  adherence_confidence: derivedState(
    z.enum(['low', 'moderate', 'high', 'unknown']),
  ),
  sport_interference_risk: derivedState(
    z.enum(['none', 'low', 'moderate', 'high', 'unknown']),
  ),
  conditioning_readiness: derivedState(
    z.enum(['low', 'moderate', 'high', 'unknown']),
  ),
  impact_tolerance: derivedState(
    z.enum(['low', 'moderate', 'high', 'unknown']),
  ),
});

const PlanningAssumptionSchema = z.object({
  code: z.string().trim().min(1),
  message: z.string().trim().min(1),
  source_fields: z.array(z.string().trim().min(1)),
  confidence: DerivedStateConfidenceSchema,
});

const MissingInputSchema = z.object({
  field: z.string().trim().min(1),
  importance: z.enum(['optional', 'recommended', 'important']),
  impact: z.string().trim().min(1),
});

const EquipmentCapabilitiesSchema = z.object({
  available_equipment: z.array(z.string()),
  unavailable_equipment: z.array(z.string()),
  dumbbell_max_kg: z.number().nonnegative().nullable(),
  source: z.enum(['explicit', 'venue_preset']),
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
  planning_assumptions: z.array(PlanningAssumptionSchema),
  missing_inputs: z.array(MissingInputSchema),
  athlete_state: AthleteStateSchema,
  equipment_capabilities: EquipmentCapabilitiesSchema,
  programme_confidence: ProgrammeConfidenceSchema,
  // Priority-resolved body fat %: inbody.body_fat_pct > body_fat_pct (manual)
  // > goal_parameters.current_body_fat_pct > null. Computed once here so AI
  // context builders and downstream consumers don't each re-derive it.
  resolved_body_fat_pct: z.number().min(0).max(100).nullable(),
});
