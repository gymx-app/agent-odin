import { createLogger } from '../../infrastructure/logging/logger.js';
import { config } from '../../infrastructure/config/env.js';
import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { PlannedResistanceSession } from '../sessions/session.types.js';
import {
  stretchByMuscle,
  SPINE_ANCHOR_STRETCH,
  FALLBACK_STRETCHES,
  type StretchEntry,
} from './stretch-muscle-map.js';

const logger = createLogger(config);

type CooldownItem = PlannedResistanceSession['day']['cooldown'][number];

export type PlannedCooldown = {
  items: CooldownItem[];
  duration_seconds: number;
};

export type CooldownPlannerInput = {
  profile: NormalizedAthleteProfile;
  session: PlannedResistanceSession;
  exercises: Exercise[];
};

const cooldownItem = (
  dayId: string,
  order: number,
  entry: StretchEntry,
  durationSeconds: number,
): CooldownItem => ({
  cooldown_id: `${dayId}-cooldown-${order}`,
  display_order: order,
  activity_name: entry.activity_name,
  exercise_id: entry.exercise_id,
  duration_seconds: durationSeconds,
  purpose: entry.notes,
});

// ACSM: 10–30s for general population, 30–60s for adults ≥40.
// Using the upper end of each range for effectiveness.
const holdDurationSeconds = (age: number): number => (age >= 40 ? 30 : 20);

const maxItems = (sessionDurationMin: number): number =>
  sessionDurationMin <= 45 ? 3 : 5;

const primaryMusclesFromSession = (
  session: PlannedResistanceSession,
  exercises: Exercise[],
): string[] => {
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const muscleCounts = new Map<string, number>();

  for (const prescription of session.day.exercises) {
    const exercise = exerciseById.get(prescription.exercise_id);
    if (!exercise) continue;
    for (const muscle of exercise.primary_muscles) {
      muscleCounts.set(muscle, (muscleCounts.get(muscle) ?? 0) + 1);
    }
  }

  return [...muscleCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([muscle]) => muscle);
};

export const planSessionCooldown = (input: CooldownPlannerInput): PlannedCooldown => {
  const dayId = input.session.day.day_id;
  const age = input.profile.source.age;
  const sessionDurationMin = input.profile.source.session_duration_min;
  const holdSeconds = holdDurationSeconds(age);
  const limit = maxItems(sessionDurationMin);

  const rankedMuscles = primaryMusclesFromSession(input.session, input.exercises);
  const selected: StretchEntry[] = [];
  const usedExerciseIds = new Set<string>();
  const usedMovementPatterns = new Set<string>();

  // Always prepend the spine anchor.
  selected.push(SPINE_ANCHOR_STRETCH);
  usedExerciseIds.add(SPINE_ANCHOR_STRETCH.exercise_id);
  usedMovementPatterns.add(SPINE_ANCHOR_STRETCH.movement_pattern);

  // Fill remaining slots from session muscles, ranked by frequency.
  // Skip if same exercise or same movement pattern already selected.
  for (const muscle of rankedMuscles) {
    if (selected.length >= limit) break;
    const entry = stretchByMuscle[muscle];
    if (!entry) continue;
    if (usedExerciseIds.has(entry.exercise_id)) continue;
    if (usedMovementPatterns.has(entry.movement_pattern)) continue;
    selected.push(entry);
    usedExerciseIds.add(entry.exercise_id);
    usedMovementPatterns.add(entry.movement_pattern);
  }

  // Pad with fallbacks if we are below the minimum of 3.
  if (selected.length < 3) {
    logger.warn('cooldown-planner: fewer than 3 stretches resolved, padding with fallbacks', {
      dayId,
      resolved: selected.length,
      exerciseCount: input.session.day.exercises.length,
    });
    for (const entry of FALLBACK_STRETCHES) {
      if (selected.length >= 3) break;
      if (usedExerciseIds.has(entry.exercise_id)) continue;
      selected.push(entry);
      usedExerciseIds.add(entry.exercise_id);
    }
  }

  const items = selected.map((entry, index) =>
    cooldownItem(dayId, index + 1, entry, holdSeconds),
  );

  return {
    items,
    duration_seconds: items.length * holdSeconds,
  };
};
