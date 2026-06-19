import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import type { ExerciseEquipment } from '../domain/exercise/exercise-taxonomy.js';

const presetEquipment: Record<AthleteInput['equipment'], ExerciseEquipment[]> =
  {
    full_gym: [
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
    ],
    dumbbells_only: ['bodyweight', 'dumbbell', 'bench'],
    bodyweight: ['bodyweight'],
    home_gym: ['bodyweight', 'dumbbell', 'resistance_band', 'bench'],
    hotel_gym: [
      'bodyweight',
      'dumbbell',
      'cable',
      'machine',
      'bench',
      'treadmill',
      'bike',
    ],
  };

export const normalizeEquipmentCapabilities = (input: AthleteInput) => {
  const details = input.equipment_details;

  if (details?.available_equipment) {
    return {
      available_equipment: details.available_equipment,
      unavailable_equipment: details.unavailable_equipment ?? [],
      dumbbell_max_kg: details.dumbbell_max_kg ?? null,
      source: 'explicit' as const,
    };
  }

  const unavailable = new Set(details?.unavailable_equipment ?? []);

  return {
    available_equipment: presetEquipment[input.equipment].filter(
      (equipment) => !unavailable.has(equipment),
    ),
    unavailable_equipment: details?.unavailable_equipment ?? [],
    dumbbell_max_kg: details?.dumbbell_max_kg ?? null,
    source: 'venue_preset' as const,
  };
};
