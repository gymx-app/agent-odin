import { describe, expect, it } from 'vitest';
import {
  classifyEnergyAvailability,
  classifyProteinAdequacy,
} from '../../src/normalization/nutrition-state.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { createAthlete } from './test-athletes.js';

describe('nutrition state', () => {
  it.each(['deficit', 'maintenance'] as const)(
    'preserves explicit %s calorie status',
    (calorieStatus) => {
      expect(
        classifyEnergyAvailability(
          createAthlete({
            nutrition: { calorie_status: calorieStatus },
          }),
        ).value,
      ).toBe(calorieStatus);
    },
  );

  it('keeps fat-loss energy availability unknown without explicit status', () => {
    expect(
      classifyEnergyAvailability(createAthlete({ goal: 'fat_loss' })),
    ).toMatchObject({
      value: 'unknown',
      confidence: 'low',
    });
  });

  it('classifies protein from intake relative to body weight', () => {
    expect(
      classifyProteinAdequacy(
        createAthlete({
          current_weight_kg: 80,
          nutrition: {
            estimated_protein_g_per_day: 136,
            protein_adequacy_confidence: 'high',
          },
        }),
      ),
    ).toMatchObject({
      value: 'likely_adequate',
      confidence: 'high',
    });
  });

  it('keeps diet pattern neutral to athlete state', () => {
    const vegan = normalizeAthlete(
      createAthlete({ nutrition: { diet_pattern: 'vegan' } }),
    );
    const omnivore = normalizeAthlete(
      createAthlete({ nutrition: { diet_pattern: 'omnivore' } }),
    );

    expect(vegan.athlete_state).toStrictEqual(omnivore.athlete_state);
    expect(vegan.recovery_capacity).toBe(omnivore.recovery_capacity);
    expect(vegan.source.available_days_per_week).toBe(
      omnivore.source.available_days_per_week,
    );
    expect(vegan.movement_restrictions).toStrictEqual(
      omnivore.movement_restrictions,
    );
  });
});
