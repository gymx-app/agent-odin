import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type {
  AiStrategyContext,
  AiPhaseContext,
} from './ai-programme-generation-provider.js';
import type { AiStrategyOutput, PhaseSummary } from './ai-generation.types.js';
import * as evidence from '../../planning/evidence.js';

const ageBand = (age: number): string => {
  if (age < 18) return 'under_18';
  if (age < 30) return '18_29';
  if (age < 40) return '30_39';
  if (age < 50) return '40_49';
  if (age < 60) return '50_59';
  return '60_plus';
};

const buildEvidenceRules = () => ({
  volume_fill_rates: evidence.VOLUME_FILL_RATES,
  volume_fill_rate_citations: evidence.VOLUME_FILL_RATE_CITATIONS,
  min_session_volume_fraction: evidence.MIN_SESSION_VOLUME_FRACTION,
  min_session_volume_citations: evidence.MIN_SESSION_VOLUME_CITATIONS,
  equipment_preference: evidence.EQUIPMENT_PREFERENCE,
  equipment_preference_citations: evidence.EQUIPMENT_PREFERENCE_CITATIONS,
  finisher_duration: evidence.FINISHER_DURATION,
  finisher_duration_citations: evidence.FINISHER_DURATION_CITATIONS,
  hiit_cycling: evidence.HIIT_CYCLING,
  hiit_cycling_citations: evidence.HIIT_CYCLING_CITATIONS,
  beginner_hiit_exclusion: evidence.BEGINNER_HIIT_EXCLUSION,
  beginner_hiit_citations: evidence.BEGINNER_HIIT_CITATIONS,
});

const buildAthleteContext = (profile: NormalizedAthleteProfile) => ({
  age_band: ageBand(profile.source.age),
  sex: profile.source.sex,
  goal: profile.source.goal,
  fitness_level: profile.source.fitness_level,
  available_days_per_week: profile.source.available_days_per_week,
  session_duration_min: profile.source.session_duration_min,
  equipment: profile.source.equipment,
  current_weight_kg: profile.source.current_weight_kg,
  target_weight_kg: profile.source.target_weight_kg,
  recovery_capacity: profile.recovery_capacity,
  athlete_state: {
    training_status: profile.athlete_state.training_status.value,
    schedule_capacity: profile.athlete_state.schedule_capacity.value,
    recovery_capacity: profile.athlete_state.recovery_capacity.value,
    energy_availability: profile.athlete_state.energy_availability.value,
    adherence_confidence: profile.athlete_state.adherence_confidence.value,
    sport_interference_risk: profile.athlete_state.sport_interference_risk.value,
    conditioning_readiness: profile.athlete_state.conditioning_readiness.value,
    impact_tolerance: profile.athlete_state.impact_tolerance.value,
  },
  movement_restrictions: profile.movement_restrictions,
  health_flags: profile.health_flags.map(({ code, severity, message }) => ({
    code,
    severity,
    summary: message,
  })),
});

const summariseExerciseLibrary = (exercises: Exercise[]) => {
  const byPattern: Record<string, { count: number; equipment: string[] }> = {};
  for (const ex of exercises) {
    for (const pattern of ex.movement_patterns) {
      const entry = byPattern[pattern] ?? { count: 0, equipment: [] };
      entry.count++;
      for (const eq of ex.equipment) {
        if (!entry.equipment.includes(eq)) entry.equipment.push(eq);
      }
      byPattern[pattern] = entry;
    }
  }
  return {
    total_exercises: exercises.length,
    by_movement_pattern: byPattern,
  };
};

export const buildAiStrategyContext = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
): AiStrategyContext => ({
  athlete: buildAthleteContext(profile),
  evidence_rules: buildEvidenceRules(),
  exercise_library_summary: summariseExerciseLibrary(exercises),
  constraints: {
    max_session_duration_min: profile.source.session_duration_min,
    available_days_per_week: profile.source.available_days_per_week,
    equipment: profile.source.equipment,
    goal: profile.source.goal,
  },
});

export const buildAiStrategyContextV2 = (
  profile: NormalizedAthleteProfile,
  exercises: Exercise[],
  goalParameters?: Record<string, unknown>,
): AiStrategyContext => {
  const ctx = buildAiStrategyContext(profile, exercises);
  if (!goalParameters || Object.keys(goalParameters).length === 0) return ctx;
  return {
    ...ctx,
    athlete: { ...ctx.athlete, goal_parameters: goalParameters },
  };
};

export const buildAiPhaseContext = (
  profile: NormalizedAthleteProfile,
  strategy: AiStrategyOutput,
  phaseSkeleton: AiStrategyOutput['phase_skeletons'][number],
  _exercises: Exercise[],
  priorPhaseSummaries: PhaseSummary[],
): AiPhaseContext => ({
  athlete: buildAthleteContext(profile),
  strategy: strategy.strategy,
  calendar: strategy.calendar,
  phase_skeleton: phaseSkeleton,
  tool_instructions: 'Use the searchExercises tool to discover exercises. Do not guess exercise IDs — search first, then use the exact IDs from results.',
  prior_phase_summaries: priorPhaseSummaries,
  policies: {
    progression_policy_id: strategy.progression_policy.policy_id,
    conditioning_policy_id: strategy.conditioning_policy.policy_id,
    fatigue_management: strategy.fatigue_management_policy,
    substitution: strategy.substitution_policy,
  },
  constraints: {
    max_session_duration_min: profile.source.session_duration_min,
    equipment: profile.source.equipment,
  },
});

export const summarisePhase = (
  phase: AiStrategyOutput['phase_skeletons'][number] & { weeks: unknown[] },
): PhaseSummary => {
  const typedPhase = phase as {
    phase_id: string;
    phase_type: string;
    objective: string;
    progression_model: string;
    weeks: Array<{
      days: Array<{
        exercises: Array<{
          exercise_id: string;
          primary_muscles: string[];
          sets: Array<{ set_type: string }>;
        }>;
      }>;
    }>;
  };

  const exercisesUsed = new Set<string>();
  const volumeByMuscle: Record<string, number> = {};

  for (const week of typedPhase.weeks) {
    for (const day of week.days) {
      for (const ex of day.exercises) {
        exercisesUsed.add(ex.exercise_id);
        const workingSets = ex.sets.filter((s) => s.set_type === 'working').length;
        for (const muscle of ex.primary_muscles) {
          volumeByMuscle[muscle] = (volumeByMuscle[muscle] ?? 0) + workingSets;
        }
      }
    }
  }

  return {
    phase_id: typedPhase.phase_id,
    phase_type: typedPhase.phase_type,
    objective: typedPhase.objective,
    exercises_used: [...exercisesUsed],
    volume_per_muscle_group: volumeByMuscle,
    progression_model: typedPhase.progression_model,
  };
};
