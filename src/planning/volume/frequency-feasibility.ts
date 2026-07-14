import type { NormalizedAthleteProfile } from '../../domain/athlete/athlete.types.js';
import { budgetMuscleGroups } from './muscle-volume-budgeter.js';
import { estimateMaximumSessionSets } from '../weeks/week-policies.js';
import type { WeekPlannerInput } from '../weeks/week.types.js';

// budgetMuscleGroups only reads training_status/recovery/nutrition/goal
// off the profile plus strategy.primary_objective — this stub carries
// just enough to reuse it here, before a real TrainingStrategyV2 exists
// (frequency is chosen before strategy selection, which itself depends
// on the calendar this frequency produces).
const muscleTargetInput = (
  profile: NormalizedAthleteProfile,
): WeekPlannerInput =>
  ({
    profile,
    strategy: {
      primary_objective: profile.source.goal,
    } as WeekPlannerInput['strategy'],
    calendar: { days: [] } as unknown as WeekPlannerInput['calendar'],
    phases: [],
    planned_deload_weeks: [],
  }) as WeekPlannerInput;

// Total minimum-effective sets summed across every muscle group, ignoring
// indirect (secondary-muscle) credit. This is a deliberate overestimate
// of what's required: indirect credit can only reduce true need further,
// so if capacity clears this conservative bar it clears the real,
// lower one too — without needing the movement-pattern allocation this
// early (which itself depends on the total set count this function is
// helping to decide).
const totalMinimumEffectiveSets = (profile: NormalizedAthleteProfile): number =>
  budgetMuscleGroups(muscleTargetInput(profile), 1).reduce(
    (sum, target) => sum + target.minimum_effective_target,
    0,
  );

// If the initially-chosen resistance frequency can't fit the athlete's
// minimum effective weekly volume within session-duration capacity, and
// they have more available days to give it, use more of them instead of
// silently letting weekly_volume_allocator cap volume below the minimum
// effective dose.
export const selectFeasibleResistanceFrequency = (
  profile: NormalizedAthleteProfile,
  candidateFrequency: number,
  maxAvailableFrequency: number,
): number => {
  if (candidateFrequency >= maxAvailableFrequency) {
    return candidateFrequency;
  }

  const maximumPerSession = estimateMaximumSessionSets(
    profile.source.session_duration_min,
  );
  const requiredSets = totalMinimumEffectiveSets(profile);

  let frequency = candidateFrequency;
  while (
    frequency < maxAvailableFrequency &&
    maximumPerSession * frequency < requiredSets
  ) {
    frequency += 1;
  }
  return frequency;
};
