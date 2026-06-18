import { z } from 'zod';
import { DayOfWeekSchema } from '../domain/shared/domain-enums.js';
import { validationCodes, type ValidationCode } from './validation-codes.js';

const severitySchema = z.enum(['info', 'warning', 'error']);
const validationCodeSchema = z.enum(
  Object.values(validationCodes) as [ValidationCode, ...ValidationCode[]],
);
const categorySchema = z.enum([
  'structure',
  'constraint_fit',
  'exercise_integrity',
  'movement_balance',
  'recovery_fit',
  'fatigue_management',
  'goal_specificity',
  'progression_quality',
  'session_time_fit',
  'prescription_quality',
  'naming_quality',
]);
const scoreSchema = z.number().min(0).max(100);

export const ProgrammeValidationReportSchema = z.object({
  passed: z.boolean(),
  status: z.enum(['pass', 'pass_with_warnings', 'fail']),
  overall_score: scoreSchema,
  scores: z.object({
    structure: scoreSchema,
    constraint_fit: scoreSchema,
    exercise_integrity: scoreSchema,
    movement_balance: scoreSchema,
    recovery_fit: scoreSchema,
    fatigue_management: scoreSchema,
    goal_specificity: scoreSchema,
    progression_quality: scoreSchema,
    session_time_fit: scoreSchema,
    prescription_quality: scoreSchema,
    naming_quality: scoreSchema,
  }),
  findings: z.array(
    z.object({
      code: validationCodeSchema,
      severity: severitySchema,
      category: categorySchema,
      message: z.string().min(1),
      phase_number: z.number().int().positive().nullable(),
      day_of_week: DayOfWeekSchema.nullable(),
      exercise_id: z.string().nullable(),
      metadata: z.record(z.unknown()).optional(),
    }),
  ),
  summary: z.object({
    error_count: z.number().int().nonnegative(),
    warning_count: z.number().int().nonnegative(),
    info_count: z.number().int().nonnegative(),
  }),
});
