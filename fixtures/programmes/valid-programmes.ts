import type { OdinProgramme } from '../../src/domain/programme/programme.types.js';

const exercise = {
  display_order: 1,
  exercise_id: 'goblet-squat',
  exercise_name: 'Goblet Squat',
  tags: ['dumbbell', 'squat'],
  coaching_cues: ['Controlled tempo.'],
  warnings: [],
  sets: [
    {
      set_number: 1,
      target_reps: 10,
      target_rpe: 7,
      rpe_ceiling: 8,
      rest_seconds: 90,
      set_type: 'calibration' as const,
    },
    {
      set_number: 2,
      target_reps: 10,
      target_rpe: 7,
      rpe_ceiling: 8,
      rest_seconds: 90,
      set_type: 'working' as const,
    },
    {
      set_number: 3,
      target_reps: 10,
      target_rpe: 7,
      rpe_ceiling: 8,
      rest_seconds: 90,
      set_type: 'working' as const,
    },
  ],
  progression_bounds: {
    rep_min: 8,
    rep_max: 12,
  },
  progression_rule:
    'If all sets are completed at or below the RPE ceiling, increase target reps next time until the top of the range; then increase load and reset reps.',
  equipment: ['dumbbell'],
  movement_patterns: ['squat'],
  primary_muscles: ['quads'],
  secondary_muscles: ['glutes'],
};
const cooldown = [
  {
    item_key: 'breathing',
    label: 'Breathing',
    detail: 'Easy nasal breathing.',
    display_order: 1,
  },
];
const day = (
  day_of_week: OdinProgramme['phase_week_templates'][number]['days'][number]['day_of_week'],
  workout_type: 'workout' | 'liss' | 'rest',
) => ({
  day_of_week,
  workout_type,
  title: `${day_of_week} ${workout_type}`,
  subtitle: 'Template day',
  duration_min: workout_type === 'rest' ? null : 45,
  tags: [workout_type],
  has_warmup: workout_type === 'workout',
  liss_content: workout_type === 'liss' ? '30 minutes easy walk.' : null,
  cooldown_items: cooldown,
  exercises: workout_type === 'workout' ? [exercise] : [],
});
const week = [
  day('MON', 'workout'),
  day('TUE', 'liss'),
  day('WED', 'workout'),
  day('THU', 'rest'),
  day('FRI', 'workout'),
  day('SAT', 'liss'),
  day('SUN', 'rest'),
];
const base: OdinProgramme = {
  programme: {
    name: 'Minimal Odin Programme',
    goal_type: 'fat_loss',
    goal_description: 'Build consistency.',
    start_weight_kg: 82,
    target_weight_kg: 76,
    target_weeks: 8,
    available_days: 3,
    equipment: 'full_gym',
    started_at: '2026-06-17T00:00:00.000Z',
  },
  config: {
    start_date: '2026-06-17T00:00:00.000Z',
    phase_weeks: [4],
    min_active_days: 0,
    total_phases: 1,
  },
  phases: [
    {
      phase_number: 1,
      name: 'Base',
      goal: 'Technique and consistency',
      weeks_count: 4,
      intensity_level: 5,
      volume_level: 5,
      progression_intent: 'accumulation',
    },
  ],
  phase_week_templates: [{ phase_number: 1, days: week }],
  warmup_items: [
    {
      item_key: 'pulse',
      label: 'Pulse raiser',
      detail: 'Five minutes easy cardio.',
      display_order: 1,
    },
  ],
  assumptions: ['Phase 0 placeholder programme.'],
  review_triggers: ['Pain reported.'],
  validation_summary: {
    passed: true,
    scores: {
      constraint_fit: 90,
      movement_balance: 85,
      recovery_fit: 88,
      goal_specificity: 80,
      progression_quality: 75,
      session_time_fit: 90,
    },
    warnings: [],
  },
};
export const minimalValidOdinProgramme = base;
export const multiPhaseValidOdinProgramme: OdinProgramme = {
  ...base,
  config: { ...base.config, phase_weeks: [4, 4], total_phases: 2 },
  phases: [
    ...base.phases,
    {
      phase_number: 2,
      name: 'Build',
      goal: 'Progress loading',
      weeks_count: 4,
      intensity_level: 7,
      volume_level: 6,
      progression_intent: 'intensification',
    },
  ],
  phase_week_templates: [
    ...base.phase_week_templates,
    { phase_number: 2, days: week },
  ],
};
export const validProgrammeFixtures = [
  minimalValidOdinProgramme,
  multiPhaseValidOdinProgramme,
];
