import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import type { ExerciseEquipment } from '../domain/exercise/exercise-taxonomy.js';

export type EquipmentMatchResult = {
  compatible: boolean;
  missing_equipment: ExerciseEquipment[];
  allowed_equipment: ExerciseEquipment[];
  reasons: string[];
};

const fullGymEquipment: ExerciseEquipment[] = [
  'bodyweight',
  'barbell',
  'dumbbell',
  'kettlebell',
  'cable',
  'machine',
  'smith_machine',
  'bench',
  'rack',
  'pullup_bar',
  'resistance_band',
  'treadmill',
  'bike',
  'rower',
  'elliptical',
];

const equipmentByAthleteProfile: Record<
  AthleteInput['equipment'],
  ExerciseEquipment[]
> = {
  full_gym: fullGymEquipment,
  dumbbells_only: ['bodyweight', 'dumbbell', 'bench'],
  bodyweight: ['bodyweight'],
  home_gym: ['bodyweight', 'dumbbell', 'resistance_band', 'bench'],
};

export const getAllowedEquipmentForAthlete = (
  equipment: AthleteInput['equipment'],
): ExerciseEquipment[] => equipmentByAthleteProfile[equipment];

export const matchExerciseEquipment = (
  exercise: Exercise,
  athleteEquipment: AthleteInput['equipment'],
): EquipmentMatchResult => {
  const allowedEquipment = getAllowedEquipmentForAthlete(athleteEquipment);
  const missingEquipment = exercise.equipment.filter(
    (equipment) => !allowedEquipment.includes(equipment),
  );

  return {
    compatible: missingEquipment.length === 0,
    missing_equipment: missingEquipment,
    allowed_equipment: allowedEquipment,
    reasons: missingEquipment.map(
      (equipment) =>
        `${exercise.id} requires ${equipment}, which is not included in ${athleteEquipment}.`,
    ),
  };
};
