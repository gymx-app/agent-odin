import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';

export const beginnerFatLossAthlete: AthleteInput = {
  name: 'Beginner Fat Loss',
  age: 32,
  sex: 'female',
  current_weight_kg: 82,
  target_weight_kg: 74,
  height_cm: 168,
  goal: 'fat_loss',
  available_days_per_week: 3,
  session_duration_min: 45,
  equipment: 'full_gym',
  fitness_level: 'beginner',
  injuries: [],
  inbody: null,
};

export const intermediateHypertrophyKneeAthlete: AthleteInput = {
  name: 'Intermediate Hypertrophy',
  age: 38,
  sex: 'male',
  current_weight_kg: 86,
  target_weight_kg: 90,
  height_cm: 180,
  goal: 'muscle_gain',
  available_days_per_week: 4,
  session_duration_min: 60,
  equipment: 'home_gym',
  fitness_level: 'intermediate',
  injuries: [
    {
      area: 'knee',
      severity: 'modify',
      notes: 'Avoid deep knee flexion under fatigue.',
    },
  ],
  inbody: null,
};

export const advancedStrengthInBodyAthlete: AthleteInput = {
  name: 'Advanced Strength',
  age: 29,
  sex: 'male',
  current_weight_kg: 94,
  target_weight_kg: 96,
  height_cm: 183,
  goal: 'strength',
  available_days_per_week: 5,
  session_duration_min: 90,
  equipment: 'full_gym',
  fitness_level: 'advanced',
  injuries: [],
  inbody: {
    body_fat_pct: 14.2,
    smm_kg: 42.5,
    visceral_fat_area: 72,
    bmr: 2050,
    segmental_balance: {
      left_arm: 1.01,
      right_arm: 1.02,
      left_leg: 0.99,
      right_leg: 1,
      trunk: 1.03,
    },
  },
};

export const validAthleteFixtures = [
  beginnerFatLossAthlete,
  intermediateHypertrophyKneeAthlete,
  advancedStrengthInBodyAthlete,
];
