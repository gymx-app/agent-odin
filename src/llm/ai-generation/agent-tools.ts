import type { FunctionTool } from 'openai/resources/responses/responses';

export const SEARCH_EXERCISES_TOOL: FunctionTool = {
  type: 'function',
  name: 'searchExercises',
  description:
    'Search the exercise library by movement pattern, muscle group, equipment, or difficulty. ' +
    'Returns matching exercises with their IDs, names, movement patterns, muscles, equipment, and difficulty. ' +
    'You MUST use exact exercise_id and exercise_name from the results when prescribing exercises.',
  parameters: {
    type: 'object',
    properties: {
      movement_pattern: {
        type: 'string',
        description:
          'Filter by movement pattern, e.g. squat, hinge, horizontal_push, vertical_pull, core_anti_extension, liss, etc.',
      },
      muscle_group: {
        type: 'string',
        description:
          'Filter by primary muscle group, e.g. chest, quadriceps, glutes, lats, hamstrings, etc.',
      },
      equipment: {
        type: 'string',
        description:
          'Filter by required equipment, e.g. barbell, dumbbell, cable, machine, bodyweight, etc.',
      },
      difficulty: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced'],
        description: 'Filter by exercise difficulty level.',
      },
      limit: {
        type: 'integer',
        description: 'Maximum number of results to return (default 20, max 50).',
      },
    },
    additionalProperties: false,
    required: [],
  },
  strict: false,
};

export const CHECK_VOLUME_COMPLIANCE_TOOL: FunctionTool = {
  type: 'function',
  name: 'checkVolumeCompliance',
  description:
    'Check if planned weekly working-set volume for a muscle group falls within evidence-backed ranges ' +
    'for the given fitness level. Returns compliance status, acceptable range, and a recommendation.',
  parameters: {
    type: 'object',
    properties: {
      muscle_group: {
        type: 'string',
        description: 'The muscle group to check volume for, e.g. quadriceps, chest, lats.',
      },
      weekly_sets: {
        type: 'number',
        description: 'The planned number of working sets per week for this muscle group.',
      },
      fitness_level: {
        type: 'string',
        enum: ['beginner', 'intermediate', 'advanced'],
        description: 'The athlete fitness level.',
      },
    },
    additionalProperties: false,
    required: ['muscle_group', 'weekly_sets', 'fitness_level'],
  },
  strict: true,
};

export const GET_EVIDENCE_RULE_TOOL: FunctionTool = {
  type: 'function',
  name: 'getEvidenceRule',
  description:
    'Look up an evidence-backed training rule by key. Returns the rule value and its peer-reviewed citations. ' +
    'Available keys: volume_fill_rates, min_session_volume_fraction, equipment_preference, ' +
    'finisher_duration, hiit_cycling, beginner_hiit_exclusion, ' +
    'untrained_strength_ratios, novice_strength_ratios, intermediate_strength_ratios, pushup_norms.',
  parameters: {
    type: 'object',
    properties: {
      rule_key: {
        type: 'string',
        enum: [
          'volume_fill_rates',
          'min_session_volume_fraction',
          'equipment_preference',
          'finisher_duration',
          'hiit_cycling',
          'beginner_hiit_exclusion',
          'untrained_strength_ratios',
          'novice_strength_ratios',
          'intermediate_strength_ratios',
          'pushup_norms',
        ],
        description: 'The evidence rule to look up.',
      },
    },
    additionalProperties: false,
    required: ['rule_key'],
  },
  strict: true,
};

export const AGENT_TOOLS: FunctionTool[] = [
  SEARCH_EXERCISES_TOOL,
  CHECK_VOLUME_COMPLIANCE_TOOL,
  GET_EVIDENCE_RULE_TOOL,
];
