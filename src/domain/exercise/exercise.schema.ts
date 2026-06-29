import { z } from 'zod';
import {
  EXERCISE_EQUIPMENT,
  MOVEMENT_DEMAND_TAGS,
  ExerciseEquipmentSchema,
  MovementDemandTagSchema,
  MovementPatternSchema,
  MuscleGroupSchema,
} from './exercise-taxonomy.js';

const boundedScoreSchema = z.number().int().min(0).max(5);
const positiveIntegerRangeSchema = z
  .object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  })
  .refine((range) => range.max >= range.min, {
    message: 'Range max must be greater than or equal to min.',
    path: ['max'],
  });

const nonNegativeIntegerRangeSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
  })
  .refine((range) => range.max >= range.min, {
    message: 'Range max must be greater than or equal to min.',
    path: ['max'],
  });

const uniqueArray = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  z.array(schema).refine((values) => new Set(values).size === values.length, {
    message: 'Array values must be unique.',
  });

const uniqueNonEmptyArray = <Schema extends z.ZodTypeAny>(schema: Schema) =>
  z
    .array(schema)
    .nonempty()
    .refine((values) => new Set(values).size === values.length, {
      message: 'Array values must be unique.',
    });

export const MovementDemandsSchema = z.object(
  Object.fromEntries(
    MOVEMENT_DEMAND_TAGS.map((tag) => [tag, boundedScoreSchema]),
  ) as Record<(typeof MOVEMENT_DEMAND_TAGS)[number], typeof boundedScoreSchema>,
);

export const ExerciseSchema = z
  .object({
    id: z.string().regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/),
    name: z.string().trim().min(1),
    display_name: z.string().trim().min(1).optional(),
    status: z.enum(['active', 'deprecated', 'experimental']),
    exercise_type: z.enum(['compound', 'isolation', 'cardio', 'mobility']),
    movement_patterns: uniqueNonEmptyArray(MovementPatternSchema),
    primary_muscles: uniqueNonEmptyArray(MuscleGroupSchema),
    secondary_muscles: uniqueArray(MuscleGroupSchema),
    equipment: uniqueNonEmptyArray(ExerciseEquipmentSchema),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    laterality: z.enum(['bilateral', 'unilateral', 'alternating', 'none']),
    skill_demand: boundedScoreSchema,
    stability_demand: boundedScoreSchema,
    fatigue_cost: z.object({
      systemic: boundedScoreSchema,
      local: boundedScoreSchema,
      axial: boundedScoreSchema,
      grip: boundedScoreSchema,
    }),
    movement_demands: MovementDemandsSchema,
    default_rep_range: positiveIntegerRangeSchema,
    default_rest_seconds: nonNegativeIntegerRangeSchema,
    substitution_group: z.string().trim().min(1).nullable(),
    contraindication_tags: uniqueArray(MovementDemandTagSchema),
    coaching_notes: z.array(z.string().trim().min(1)),
    aliases: uniqueArray(z.string().trim().min(1)),
  })
  .superRefine((exercise, context) => {
    const duplicatedMuscles = exercise.primary_muscles.filter((muscle) =>
      exercise.secondary_muscles.includes(muscle),
    );

    duplicatedMuscles.forEach((muscle) => {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Primary muscle "${muscle}" must not be duplicated in secondary muscles.`,
        path: ['secondary_muscles'],
      });
    });

    if (
      exercise.exercise_type === 'cardio' &&
      !exercise.movement_patterns.includes('liss')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cardio exercises must include the liss movement pattern.',
        path: ['movement_patterns'],
      });
    }

    if (
      exercise.exercise_type !== 'cardio' &&
      exercise.exercise_type !== 'mobility' &&
      exercise.movement_patterns.length === 0
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Active resistance exercises require a movement pattern.',
        path: ['movement_patterns'],
      });
    }

    const unknownEquipment = exercise.equipment.filter(
      (equipment) => !EXERCISE_EQUIPMENT.includes(equipment),
    );

    if (unknownEquipment.length > 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Exercise contains unsupported equipment.',
        path: ['equipment'],
      });
    }
  });
