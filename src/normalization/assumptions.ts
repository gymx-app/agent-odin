import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type {
  MissingInput,
  PlanningAssumption,
} from './normalization.types.js';

export const uniqueAssumptions = (assumptions: string[]): string[] => [
  ...new Set(assumptions),
];

export const createBaseAssumptions = (input: AthleteInput): string[] =>
  uniqueAssumptions([
    input.lifestyle ? '' : 'Sleep and stress data were not provided.',
    input.training_history ? '' : 'Detailed training history was not provided.',
    'Current strength levels were not provided.',
    input.nutrition ? '' : 'Nutrition and calorie intake were not provided.',
    'Target timeline was not explicitly provided.',
    input.inbody === null ? 'InBody data was not provided.' : '',
    input.injuries.length === 0
      ? 'No injuries were reported in the source input.'
      : 'Injury diagnosis and clinician restrictions were not provided.',
  ]).filter((assumption) => assumption.length > 0);

export const createPlanningAssumptions = (
  input: AthleteInput,
): PlanningAssumption[] => {
  const assumptions: PlanningAssumption[] = [];

  if (!input.training_history) {
    assumptions.push({
      code: 'TRAINING_HISTORY_MISSING',
      message: 'Legacy fitness level is used as the training-status fallback.',
      source_fields: ['fitness_level'],
      confidence: 'low',
    });
  }
  if (!input.schedule?.available_days) {
    assumptions.push({
      code: 'EXPLICIT_WEEKDAYS_MISSING',
      message: 'Only the number of available training days is known.',
      source_fields: ['available_days_per_week'],
      confidence: 'low',
    });
  }
  if (
    !input.nutrition?.calorie_status ||
    input.nutrition.calorie_status === 'unknown'
  ) {
    assumptions.push({
      code: 'CALORIE_STATUS_UNKNOWN',
      message:
        'Energy availability is unknown; goal intent is not treated as physiological state.',
      source_fields: ['goal'],
      confidence: 'low',
    });
  }
  if (!input.lifestyle) {
    assumptions.push({
      code: 'LIFESTYLE_RECOVERY_INPUTS_MISSING',
      message: 'Recovery classification uses the legacy conservative fallback.',
      source_fields: [
        'fitness_level',
        'available_days_per_week',
        'session_duration_min',
      ],
      confidence: 'low',
    });
  }
  if (input.sport && !input.sport.session_days) {
    assumptions.push({
      code: 'SPORT_SCHEDULE_INCOMPLETE',
      message: 'Sport load is represented without resolving gym-day conflicts.',
      source_fields: ['sport'],
      confidence: 'low',
    });
  }

  return assumptions;
};

export const createMissingInputs = (input: AthleteInput): MissingInput[] => [
  ...(!input.training_history
    ? [
        {
          field: 'training_history',
          importance: 'important' as const,
          impact: 'Reduces training-status and adherence confidence.',
        },
      ]
    : []),
  ...(!input.schedule?.available_days
    ? [
        {
          field: 'schedule.available_days',
          importance: 'recommended' as const,
          impact: 'Prevents weekday-specific schedule assessment.',
        },
      ]
    : []),
  ...(!input.lifestyle
    ? [
        {
          field: 'lifestyle',
          importance: 'recommended' as const,
          impact: 'Reduces recovery-capacity confidence.',
        },
      ]
    : []),
  ...(!input.nutrition?.calorie_status ||
  input.nutrition.calorie_status === 'unknown'
    ? [
        {
          field: 'nutrition.calorie_status',
          importance: 'recommended' as const,
          impact: 'Energy availability remains unknown.',
        },
      ]
    : []),
  ...(!input.nutrition?.estimated_protein_g_per_day
    ? [
        {
          field: 'nutrition.estimated_protein_g_per_day',
          importance: 'optional' as const,
          impact: 'Protein adequacy remains unknown.',
        },
      ]
    : []),
];
