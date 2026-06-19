import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import type { Exercise } from '../../domain/exercise/exercise.types.js';
import type { PlannedResistanceSession } from '../sessions/session.types.js';

export type WarmupItem = PlannedResistanceSession['day']['warmup'][number];

export type PlannedWarmup = {
  items: WarmupItem[];
  duration_seconds: number;
  rationale_codes: string[];
  compressed_for_duration: boolean;
};

export type WarmupPlannerInput = {
  profile: NormalizedAthleteProfile;
  session: PlannedResistanceSession;
  exercises: Exercise[];
};

export const estimateWarmupItemSeconds = (item: WarmupItem): number =>
  item.duration_seconds ??
  (item.component_type === 'ramp_up_set'
    ? (item.repetitions ?? 0) * 4 + 35
    : (item.repetitions ?? 0) * 3);
