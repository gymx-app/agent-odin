import { z } from 'zod';
import {
  AthleteGoalSchema,
  DayOfWeekSchema,
  EquipmentAvailabilitySchema,
  FitnessLevelSchema,
  SexSchema,
} from '../shared/domain-enums.js';
import {
  ExerciseEquipmentSchema,
  MovementDemandTagSchema,
} from '../exercise/exercise-taxonomy.js';

const uniqueArray = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  z.array(schema).superRefine((values, context) => {
    if (new Set(values).size !== values.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DUPLICATE_VALUES_NOT_ALLOWED',
      });
    }
  });

const InjurySchema = z
  .object({
    area: z.string().trim().min(1),
    severity: z.enum(['avoid', 'modify']),
    notes: z.string().trim(),
  })
  .strict();

const SegmentalBalanceSchema = z
  .object({
    left_arm: z.number(),
    right_arm: z.number(),
    left_leg: z.number(),
    right_leg: z.number(),
    trunk: z.number(),
  })
  .strict();

const InBodySchema = z
  .object({
    body_fat_pct: z.number().nonnegative(),
    smm_kg: z.number().nonnegative(),
    visceral_fat_area: z.number().nonnegative(),
    bmr: z.number().positive(),
    // Optional so that a v2 InBody payload (which allows these two fields)
    // re-validates cleanly when normalizeAthlete() re-checks profile.source
    // against this v1 schema.
    body_fat_mass_kg: z.number().nonnegative().optional(),
    total_body_water_kg: z.number().nonnegative().optional(),
    segmental_balance: SegmentalBalanceSchema,
  })
  .strict();

const TrainingHistorySchema = z
  .object({
    years_consistent_training: z.number().min(0).max(80).optional(),
    consistency_last_12_weeks: z.enum(['low', 'moderate', 'high']).optional(),
    current_sessions_per_week: z.number().int().min(0).max(14).optional(),
    current_split: z.string().trim().min(1).max(100).optional(),
    weeks_since_last_consistent_block: z
      .number()
      .int()
      .min(0)
      .max(520)
      .optional(),
    detraining_weeks: z.number().int().min(0).max(520).optional(),
    exercise_competency: z.enum(['novice', 'competent', 'advanced']).optional(),
    previous_programme_response: z
      .enum(['poor', 'mixed', 'good', 'unknown'])
      .optional(),
    recent_weekly_sets_by_muscle: z
      .record(z.number().min(0).max(100))
      .optional(),
  })
  .strict();

const ScheduleSchema = z
  .object({
    available_days: uniqueArray(DayOfWeekSchema).optional(),
    preferred_days: uniqueArray(DayOfWeekSchema).optional(),
    unavailable_days: uniqueArray(DayOfWeekSchema).optional(),
    preferred_workout_time: z.enum(['morning', 'afternoon', 'evening', 'night']).optional(),
    rolling_schedule_acceptable: z.boolean().optional(),
  })
  .strict();

const LifestyleSchema = z
  .object({
    occupation_type: z
      .enum(['sedentary', 'mixed', 'active', 'manual'])
      .optional(),
    average_daily_steps: z.number().int().min(0).max(100000).optional(),
    sleep_hours: z.number().min(0).max(24).optional(),
    sleep_quality: z.number().int().min(1).max(10).optional(),
    perceived_stress: z.number().int().min(1).max(10).optional(),
    shift_work: z.boolean().optional(),
    travel_frequency: z.enum(['rare', 'occasional', 'frequent']).optional(),
    recovery_rating: z.number().int().min(1).max(10).optional(),
  })
  .strict();

const NutritionSchema = z
  .object({
    diet_pattern: z
      .enum([
        'omnivore',
        'eggetarian',
        'lacto_vegetarian',
        'jain',
        'vegan',
        'other',
      ])
      .optional(),
    calorie_status: z
      .enum(['deficit', 'maintenance', 'surplus', 'unknown'])
      .optional(),
    estimated_protein_g_per_day: z.number().min(0).max(1000).optional(),
    protein_adequacy_confidence: z.enum(['low', 'moderate', 'high']).optional(),
    meals_per_day: z.number().int().min(0).max(20).optional(),
    supplements: uniqueArray(z.string().trim().min(1).max(100)).optional(),
    known_deficiencies: uniqueArray(
      z.string().trim().min(1).max(100),
    ).optional(),
    recent_weight_trend: z
      .enum(['losing', 'stable', 'gaining', 'unknown'])
      .optional(),
  })
  .strict();

const SportSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    sessions_per_week: z.number().int().min(0).max(14).optional(),
    session_days: uniqueArray(DayOfWeekSchema).optional(),
    typical_duration_min: z.number().int().min(1).max(480).optional(),
    intensity: z.enum(['low', 'moderate', 'high']).optional(),
    priority: z.enum(['supporting', 'equal', 'primary']).optional(),
    lower_body_load: z.enum(['low', 'moderate', 'high']).optional(),
    upper_body_load: z.enum(['low', 'moderate', 'high']).optional(),
    impact_level: z.enum(['low', 'moderate', 'high']).optional(),
    sprint_exposure: z.boolean().optional(),
    competition_date: z.string().date().optional(),
  })
  .strict()
  .superRefine((sport, context) => {
    if (
      sport.session_days &&
      sport.sessions_per_week !== undefined &&
      sport.session_days.length > sport.sessions_per_week
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['session_days'],
        message: 'SPORT_SESSION_DAYS_EXCEED_WEEKLY_SESSIONS',
      });
    }
  });

const EquipmentDetailsSchema = z
  .object({
    available_equipment: uniqueArray(ExerciseEquipmentSchema).optional(),
    unavailable_equipment: uniqueArray(ExerciseEquipmentSchema).optional(),
    dumbbell_max_kg: z.number().min(0).max(500).optional(),
  })
  .strict()
  .superRefine((details, context) => {
    const available = new Set(details.available_equipment ?? []);
    const overlap = (details.unavailable_equipment ?? []).filter((item) =>
      available.has(item),
    );

    if (overlap.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unavailable_equipment'],
        message: 'EQUIPMENT_CAPABILITY_CONTRADICTION',
      });
    }
  });

const EnrichedMovementRestrictionSchema = z
  .object({
    region: z.string().trim().min(1).max(100),
    movement_demand: MovementDemandTagSchema,
    tolerance: z.enum(['eligible', 'modifiable', 'excluded']),
    severity: z.number().int().min(1).max(10).optional(),
    notes: z.string().trim().max(500).optional(),
    clinician_restriction: z.boolean().optional(),
  })
  .strict();

const OriginMetadataSchema = z
  .object({
    country: z.string().trim().min(1).max(100).optional(),
    ethnicity: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export const AthleteInputBaseSchema = z.object({
    name: z.string().trim().min(1),
    age: z.number().int().min(16).max(100),
    sex: SexSchema,
    current_weight_kg: z.number().positive(),
    target_weight_kg: z.number().positive(),
    height_cm: z.number().positive(),
    // Manually entered body fat % (distinct from inbody.body_fat_pct, which
    // takes priority when present — see athlete-normalizer.ts's
    // resolveBodyFatPct).
    body_fat_pct: z.number().min(0).max(100).optional(),
    goal: AthleteGoalSchema,
    available_days_per_week: z.number().int().min(2).max(7),
    session_duration_min: z.number().int().min(20).max(180),
    equipment: EquipmentAvailabilitySchema,
    fitness_level: FitnessLevelSchema,
    injuries: z.array(InjurySchema),
    inbody: InBodySchema.nullable().default(null),
    training_history: TrainingHistorySchema.optional(),
    schedule: ScheduleSchema.optional(),
    lifestyle: LifestyleSchema.optional(),
    nutrition: NutritionSchema.optional(),
    sport: SportSchema.optional(),
    equipment_details: EquipmentDetailsSchema.optional(),
    movement_restrictions: z
      .array(EnrichedMovementRestrictionSchema)
      .optional(),
    waist_circumference_cm: z.number().positive().max(300).optional(),
    lean_mass_kg: z.number().positive().max(500).optional(),
    origin_metadata: OriginMetadataSchema.optional(),
    // Low-priority AI context field — no deterministic pipeline logic.
    nationality: z.string().trim().min(1).max(100).optional(),
  });

export const AthleteInputSchema = AthleteInputBaseSchema
  .superRefine((input, context) => {
    const available = input.schedule?.available_days;
    const unavailable = new Set(input.schedule?.unavailable_days ?? []);

    if (available) {
      const overlap = available.filter((day) => unavailable.has(day));

      if (overlap.length > 0) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['schedule', 'available_days'],
          message: 'SCHEDULE_DAY_AVAILABLE_AND_UNAVAILABLE',
        });
      }

      if (available.length !== input.available_days_per_week) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['schedule', 'available_days'],
          message: 'SCHEDULE_AVAILABLE_DAY_COUNT_MISMATCH',
        });
      }

      const availableSet = new Set(available);
      if (
        input.schedule?.preferred_days?.some((day) => !availableSet.has(day))
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['schedule', 'preferred_days'],
          message: 'SCHEDULE_PREFERRED_DAY_NOT_AVAILABLE',
        });
      }
    }
  });
