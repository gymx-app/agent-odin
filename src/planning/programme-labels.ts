import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { WeekSession } from './planning.types.js';

export const programmeNameForGoal = (goal: AthleteInput['goal']): string => {
  const names: Record<AthleteInput['goal'], string> = {
    fat_loss: 'Fat Loss Base',
    muscle_gain: 'Hypertrophy Base',
    recomposition: 'Recomposition Base',
    strength: 'Strength Base',
    endurance: 'Endurance Base',
    general_fitness: 'General Fitness Base',
  };

  return names[goal];
};

export const workoutTitle = (session: WeekSession): string => {
  const baseTitle: Record<WeekSession['kind'], string> = {
    full_body: 'Full Body',
    upper: 'Upper Body',
    lower: 'Lower Body',
    push: 'Push',
    pull: 'Pull',
    legs: 'Legs',
    liss: 'LISS Cardio',
    rest: 'Rest',
  };

  if (session.emphasis && session.kind !== 'liss' && session.kind !== 'rest') {
    return `${baseTitle[session.kind]} — ${session.emphasis}`;
  }

  return baseTitle[session.kind];
};

export const exerciseDisplayName = (exerciseName: string): string =>
  exerciseName
    .replaceAll('Dumbbell', 'DB')
    .replace('Machine Leg Press', 'Leg Press')
    .replace('Seated Cable Row', 'Cable Row')
    .replace('Dumbbell Romanian Deadlift', 'DB Romanian Deadlift')
    .replace('Machine Leg Extension', 'Leg Extension')
    .replace('Machine Shoulder Press', 'Machine Shoulder Press');
