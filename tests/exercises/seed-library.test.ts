import { describe, expect, it } from 'vitest';
import { ExerciseSchema } from '../../src/domain/exercise/exercise.schema.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { validateExerciseLibrary } from '../../src/exercises/library-validator.js';
import {
  EXERCISE_EQUIPMENT,
  MOVEMENT_PATTERNS,
} from '../../src/domain/exercise/exercise-taxonomy.js';

describe('seed exercise library', () => {
  it('passes schema validation for every exercise', () => {
    expect(
      seedExercises.every(
        (exercise) => ExerciseSchema.safeParse(exercise).success,
      ),
    ).toBe(true);
  });

  it('has unique IDs', () => {
    expect(new Set(seedExercises.map((exercise) => exercise.id)).size).toBe(
      seedExercises.length,
    );
  });

  it('covers movement patterns', () => {
    const coveredPatterns = new Set(
      seedExercises.flatMap((exercise) => exercise.movement_patterns),
    );

    MOVEMENT_PATTERNS.forEach((pattern) => {
      expect(coveredPatterns.has(pattern)).toBe(true);
    });
  });

  it('has equipment diversity', () => {
    const coveredEquipment = new Set(
      seedExercises.flatMap((exercise) => exercise.equipment),
    );

    expect(coveredEquipment.size).toBeGreaterThanOrEqual(10);
    expect(
      EXERCISE_EQUIPMENT.some((equipment) => coveredEquipment.has(equipment)),
    ).toBe(true);
  });

  it('has the expected curated scope', () => {
    expect(seedExercises.length).toBeGreaterThanOrEqual(200);
    expect(seedExercises.length).toBeLessThanOrEqual(400);
  });

  it('passes library validation without errors', () => {
    const result = validateExerciseLibrary(seedExercises);

    expect(result.valid).toBe(true);
    expect(result.issues.filter((issue) => issue.severity === 'error')).toEqual(
      [],
    );
  });
});
