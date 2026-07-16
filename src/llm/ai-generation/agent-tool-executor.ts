import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import * as evidence from '../../planning/evidence.js';

export type ToolExecutor = (
  toolName: string,
  args: Record<string, unknown>,
) => unknown;

type SearchExercisesArgs = {
  movement_pattern?: string;
  muscle_group?: string;
  equipment?: string;
  difficulty?: string;
  limit?: number;
};

type CheckVolumeArgs = {
  muscle_group: string;
  weekly_sets: number;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
};

type GetEvidenceRuleArgs = {
  rule_key: string;
};

const EVIDENCE_RULES: Record<string, { value: unknown; citations: readonly string[] }> = {
  volume_fill_rates: { value: evidence.VOLUME_FILL_RATES, citations: evidence.VOLUME_FILL_RATE_CITATIONS },
  min_session_volume_fraction: { value: evidence.MIN_SESSION_VOLUME_FRACTION, citations: evidence.MIN_SESSION_VOLUME_CITATIONS },
  equipment_preference: { value: evidence.EQUIPMENT_PREFERENCE, citations: evidence.EQUIPMENT_PREFERENCE_CITATIONS },
  finisher_duration: { value: evidence.FINISHER_DURATION, citations: evidence.FINISHER_DURATION_CITATIONS },
  hiit_cycling: { value: evidence.HIIT_CYCLING, citations: evidence.HIIT_CYCLING_CITATIONS },
  beginner_hiit_exclusion: { value: evidence.BEGINNER_HIIT_EXCLUSION, citations: evidence.BEGINNER_HIIT_CITATIONS },
  untrained_strength_ratios: { value: evidence.UNTRAINED_STRENGTH_RATIOS, citations: evidence.STRENGTH_RATIO_CITATIONS },
  novice_strength_ratios: { value: evidence.NOVICE_STRENGTH_RATIOS, citations: evidence.STRENGTH_RATIO_CITATIONS },
  intermediate_strength_ratios: { value: evidence.INTERMEDIATE_STRENGTH_RATIOS, citations: evidence.STRENGTH_RATIO_CITATIONS },
  pushup_norms: { value: evidence.PUSHUP_NORMS, citations: evidence.PUSHUP_NORM_CITATIONS },
  // No single "value" constant — set-structure choice is a categorical
  // decision, not a numeric parameter — so this exposes the citation
  // registry entries the model needs to cite each technique correctly,
  // including the split tier for cluster sets (velocity vs. hypertrophy).
  set_structure_evidence: {
    value: {
      straight: 'always valid, no citation needed',
      pyramid: 'heuristic, not separately validated',
      drop_set: 'isolation/accessory only, time efficiency',
      rest_pause: 'isolation/accessory only, time efficiency',
      cluster: 'compound strength/power work, velocity preservation',
      superset: 'isolation/accessory only, time efficiency',
      giant_set: 'isolation/accessory only, sparingly, no dedicated citation',
    },
    citations: evidence.SET_STRUCTURE_CITATIONS,
  },
};

// Schoenfeld 2017 / RP Volume Landmarks: evidence-backed weekly set ranges per muscle group.
// MV ~6, MEV 6-8, MAV 12-20, individual MRV varies.
const VOLUME_RANGES: Record<string, { min: number; max: number }> = {
  beginner: { min: 4, max: 12 },
  intermediate: { min: 8, max: 18 },
  advanced: { min: 10, max: 22 },
};

export const createToolExecutor = (
  exercises: Exercise[],
  profile: NormalizedAthleteProfile,
): ToolExecutor => {
  const avoidTags = new Set(
    profile.movement_restrictions
      .filter((r) => r.severity === 'avoid')
      .map((r) => r.tag),
  );

  const safeExercises = avoidTags.size > 0
    ? exercises.filter((ex) => !ex.contraindication_tags.some((tag) => avoidTags.has(tag)))
    : exercises;

  return (toolName: string, args: Record<string, unknown>): unknown => {
    switch (toolName) {
      case 'searchExercises':
        return searchExercises(safeExercises, args as SearchExercisesArgs);
      case 'checkVolumeCompliance':
        return checkVolumeCompliance(args as CheckVolumeArgs);
      case 'getEvidenceRule':
        return getEvidenceRule(args as GetEvidenceRuleArgs);
      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  };
};

const searchExercises = (exercises: Exercise[], args: SearchExercisesArgs) => {
  let results = exercises;

  if (args.movement_pattern) {
    results = results.filter((ex) =>
      ex.movement_patterns.includes(args.movement_pattern as never),
    );
  }
  if (args.muscle_group) {
    results = results.filter((ex) =>
      ex.primary_muscles.includes(args.muscle_group as never),
    );
  }
  if (args.equipment) {
    results = results.filter((ex) =>
      ex.equipment.includes(args.equipment as never),
    );
  }
  if (args.difficulty) {
    results = results.filter((ex) => ex.difficulty === args.difficulty);
  }

  const limit = Math.min(args.limit ?? 20, 50);
  results = results.slice(0, limit);

  return results.map((ex) => ({
    exercise_id: ex.id,
    exercise_name: ex.display_name ?? ex.name,
    movement_patterns: ex.movement_patterns,
    primary_muscles: ex.primary_muscles,
    secondary_muscles: ex.secondary_muscles,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    exercise_type: ex.exercise_type,
    default_rep_range: ex.default_rep_range,
  }));
};

const checkVolumeCompliance = (args: CheckVolumeArgs) => {
  const range = VOLUME_RANGES[args.fitness_level];
  if (!range) {
    return { error: `Unknown fitness level: ${args.fitness_level}` };
  }

  const compliant = args.weekly_sets >= range.min && args.weekly_sets <= range.max;
  let recommendation: string;
  if (args.weekly_sets < range.min) {
    recommendation = `Volume too low for ${args.muscle_group}. Minimum ${range.min} sets/week recommended for ${args.fitness_level} trainees (Schoenfeld 2017, RP Volume Landmarks).`;
  } else if (args.weekly_sets > range.max) {
    recommendation = `Volume too high for ${args.muscle_group}. Maximum ${range.max} sets/week recommended for ${args.fitness_level} trainees to stay within MRV (RP Volume Landmarks).`;
  } else {
    recommendation = `Volume is within the evidence-backed range for ${args.fitness_level} trainees.`;
  }

  return {
    muscle_group: args.muscle_group,
    weekly_sets: args.weekly_sets,
    fitness_level: args.fitness_level,
    compliant,
    min_sets: range.min,
    max_sets: range.max,
    recommendation,
    citations: ['SCHOENFELD_2017_DOSE_RESPONSE', 'ISRAETEL_RP_VOLUME_LANDMARKS'],
  };
};

const getEvidenceRule = (args: GetEvidenceRuleArgs) => {
  const rule = EVIDENCE_RULES[args.rule_key];
  if (!rule) {
    return { error: `Unknown evidence rule: ${args.rule_key}. Available: ${Object.keys(EVIDENCE_RULES).join(', ')}` };
  }
  return { rule_key: args.rule_key, ...rule };
};
