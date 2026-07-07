import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';

// Fills diversity gaps not covered by valid-athletes.ts: no multi-injury,
// bodyweight-only, older (50+), or female-strength profile existed before.
// full_gym (not home_gym) is deliberate here — home_gym + any injury
// restriction currently throws PROGRAMME_REPAIR_FAILED in the longitudinal
// planner (a pre-existing bug also reproducible on the existing
// intermediateHypertrophyKneeAthlete fixture), tracked separately.
export const multiInjuryAthlete: AthleteInput = {
  name: 'Multi Injury',
  age: 45,
  sex: 'male',
  current_weight_kg: 88,
  target_weight_kg: 84,
  height_cm: 178,
  goal: 'muscle_gain',
  available_days_per_week: 4,
  session_duration_min: 55,
  equipment: 'full_gym',
  fitness_level: 'intermediate',
  injuries: [
    { area: 'shoulder', severity: 'avoid', notes: 'Avoid overhead pressing.' },
    {
      area: 'lower_back',
      severity: 'modify',
      notes: 'Avoid loaded spinal flexion.',
    },
  ],
  inbody: null,
};

export const bodyweightOnlyAthlete: AthleteInput = {
  name: 'Bodyweight Only',
  age: 27,
  sex: 'female',
  current_weight_kg: 63,
  target_weight_kg: 58,
  height_cm: 165,
  goal: 'fat_loss',
  available_days_per_week: 3,
  session_duration_min: 40,
  equipment: 'bodyweight',
  fitness_level: 'beginner',
  injuries: [],
  inbody: null,
};

export const olderStrengthAthlete: AthleteInput = {
  name: 'Older Strength',
  age: 58,
  sex: 'male',
  current_weight_kg: 84,
  target_weight_kg: 82,
  height_cm: 176,
  goal: 'strength',
  available_days_per_week: 3,
  session_duration_min: 60,
  equipment: 'full_gym',
  fitness_level: 'intermediate',
  injuries: [],
  inbody: null,
};

export const femaleStrengthAthlete: AthleteInput = {
  name: 'Female Strength',
  age: 30,
  sex: 'female',
  current_weight_kg: 65,
  target_weight_kg: 66,
  height_cm: 167,
  goal: 'strength',
  available_days_per_week: 4,
  session_duration_min: 75,
  equipment: 'full_gym',
  fitness_level: 'intermediate',
  injuries: [],
  inbody: null,
};

export const goldenSetAthleteFixtures = [
  multiInjuryAthlete,
  bodyweightOnlyAthlete,
  olderStrengthAthlete,
  femaleStrengthAthlete,
];
