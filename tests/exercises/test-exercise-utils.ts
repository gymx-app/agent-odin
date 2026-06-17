import type { Exercise } from '../../src/domain/exercise/exercise.types.js';
import { MOVEMENT_DEMAND_TAGS } from '../../src/domain/exercise/exercise-taxonomy.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';

export const findSeedExercise = (id: string): Exercise => {
  const exercise = seedExercises.find((candidate) => candidate.id === id);

  if (!exercise) {
    throw new Error(`Missing seed exercise: ${id}`);
  }

  return exercise;
};

export const zeroMovementDemands = (): Exercise['movement_demands'] =>
  Object.fromEntries(
    MOVEMENT_DEMAND_TAGS.map((tag) => [tag, 0]),
  ) as Exercise['movement_demands'];

export const createExercisePatch = (patch: Partial<Exercise>): Exercise => ({
  ...findSeedExercise('dumbbell_goblet_squat'),
  ...patch,
});
