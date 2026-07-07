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

export const enrichedRecompositionAthlete: AthleteInput = {
  name: 'Enriched Recomposition',
  age: 34,
  sex: 'female',
  current_weight_kg: 68,
  target_weight_kg: 66,
  height_cm: 169,
  goal: 'recomposition',
  available_days_per_week: 4,
  session_duration_min: 60,
  equipment: 'full_gym',
  fitness_level: 'intermediate',
  injuries: [],
  inbody: null,
  training_history: {
    years_consistent_training: 3,
    consistency_last_12_weeks: 'high',
    current_sessions_per_week: 4,
    current_split: 'Upper lower',
    weeks_since_last_consistent_block: 0,
    detraining_weeks: 0,
    exercise_competency: 'competent',
    previous_programme_response: 'good',
    recent_weekly_sets_by_muscle: {
      quadriceps: 10,
      chest: 8,
    },
  },
  schedule: {
    available_days: ['MON', 'TUE', 'THU', 'SAT'],
    preferred_days: ['MON', 'THU'],
    // SUN is not listed here: the athlete plays tennis on SUN (see `sport`
    // below), so it's occupied by sport, not truly unavailable — listing it
    // as unavailable directly contradicted sport.session_days and made the
    // calendar unsatisfiable (CALENDAR_UNSATISFIABLE).
    unavailable_days: ['WED', 'FRI'],
    preferred_workout_time: 'evening',
    rolling_schedule_acceptable: false,
  },
  lifestyle: {
    occupation_type: 'mixed',
    average_daily_steps: 8500,
    sleep_hours: 7.5,
    sleep_quality: 8,
    perceived_stress: 4,
    shift_work: false,
    travel_frequency: 'occasional',
    recovery_rating: 8,
  },
  nutrition: {
    diet_pattern: 'lacto_vegetarian',
    calorie_status: 'maintenance',
    estimated_protein_g_per_day: 115,
    protein_adequacy_confidence: 'moderate',
    meals_per_day: 4,
    supplements: ['creatine'],
    known_deficiencies: [],
    recent_weight_trend: 'stable',
  },
  sport: {
    name: 'Recreational tennis',
    sessions_per_week: 1,
    session_days: ['SUN'],
    typical_duration_min: 60,
    intensity: 'moderate',
    priority: 'supporting',
    lower_body_load: 'moderate',
    upper_body_load: 'moderate',
    impact_level: 'moderate',
    sprint_exposure: false,
  },
  equipment_details: {
    available_equipment: [
      'bodyweight',
      'barbell',
      'dumbbell',
      'cable',
      'machine',
      'bench',
      'rack',
    ],
    unavailable_equipment: ['rower'],
    dumbbell_max_kg: 40,
  },
  waist_circumference_cm: 76,
  lean_mass_kg: 48,
  origin_metadata: {
    country: 'India',
    ethnicity: 'South Asian',
  },
};

export const validAthleteFixtures = [
  beginnerFatLossAthlete,
  intermediateHypertrophyKneeAthlete,
  advancedStrengthInBodyAthlete,
  enrichedRecompositionAthlete,
];
