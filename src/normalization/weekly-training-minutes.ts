import type { AthleteInput } from '../domain/athlete/athlete.types.js';

export const calculateWeeklyTrainingMinutes = (
  input: Pick<AthleteInput, 'available_days_per_week' | 'session_duration_min'>,
): number => input.available_days_per_week * input.session_duration_min;
