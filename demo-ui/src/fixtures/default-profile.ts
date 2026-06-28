import type { AthleteInput } from '../api/contracts';

export const defaultProfile: AthleteInput = {
  name: 'Alex Morgan',
  age: 32,
  sex: 'male',
  current_weight_kg: 84,
  target_weight_kg: 79,
  height_cm: 180,
  goal: 'recomposition',
  available_days_per_week: 4,
  session_duration_min: 60,
  equipment: 'full_gym',
  fitness_level: 'intermediate',
  injuries: [],
  inbody: null,
};
