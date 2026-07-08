// A minimal, valid AthleteInputV2Schema payload for endpoint-level tests —
// mirrors fixtures/athletes/valid-athletes.ts (beginnerFatLossAthlete) but in
// the v2 request shape (injuries use `modification`, not `severity`).
export const createV2Athlete = (patch: Record<string, unknown> = {}) => ({
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
  injuries: [] as { area: string; modification: 'avoid' | 'modify'; notes?: string }[],
  inbody: null,
  baseline_path: 'skipped' as const,
  known_lifts: null,
  ...patch,
});
