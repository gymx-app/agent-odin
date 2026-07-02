import type {
  AthleteInput,
  NormalizedAthleteProfile,
} from '../domain/athlete/athlete.types.js';
import { NormalizedAthleteProfileSchema } from '../domain/athlete/normalized-athlete-profile.schema.js';
import { calculateWeeklyTrainingMinutes } from './weekly-training-minutes.js';
import { calculateWeightChange } from './weight-change.js';
import { estimateProgrammeHorizonWeeks } from './programme-horizon.js';
import { mapInjuriesToRestrictions } from './injury-restrictions.js';
import { createHealthFlags } from './health-flags.js';
import {
  createBaseAssumptions,
  createMissingInputs,
  createPlanningAssumptions,
  uniqueAssumptions,
} from './assumptions.js';
import { estimateRecoveryCapacity } from './recovery-capacity.js';
import { calculateProgrammeConfidence } from './programme-confidence.js';
import { deriveAthleteState } from './athlete-state.js';
import { normalizeEquipmentCapabilities } from './equipment-capabilities.js';

// goal_parameters is a v2-only field not present on the v1-shaped
// AthleteInput type that this module is typed against — the v2 route casts
// its request body to AthleteInput before calling normalizeAthlete, so the
// field is present at runtime even though the type doesn't know about it.
type InputWithV2BodyFatSources = AthleteInput & {
  goal_parameters?: { current_body_fat_pct?: number };
};

const resolveBodyFatPct = (input: AthleteInput): number | null => {
  const v2Input = input as InputWithV2BodyFatSources;
  return (
    input.inbody?.body_fat_pct ??
    v2Input.body_fat_pct ??
    v2Input.goal_parameters?.current_body_fat_pct ??
    null
  );
};

export const normalizeAthlete = (
  input: AthleteInput,
): NormalizedAthleteProfile => {
  const weeklyTrainingMinutes = calculateWeeklyTrainingMinutes(input);
  const weightChange = calculateWeightChange(input);
  const injuryRestrictions = mapInjuriesToRestrictions(
    input.injuries,
    input.movement_restrictions,
  );
  const healthFlags = [
    ...createHealthFlags(input, weightChange, weeklyTrainingMinutes),
    ...injuryRestrictions.healthFlags,
  ];
  const assumptions = uniqueAssumptions([
    ...createBaseAssumptions(input),
    ...injuryRestrictions.assumptions,
  ]);
  const planningAssumptions = createPlanningAssumptions(input);
  const missingInputs = createMissingInputs(input);
  const athleteState = deriveAthleteState(
    input,
    weeklyTrainingMinutes,
    healthFlags,
    injuryRestrictions.movementRestrictions,
  );

  const profile: NormalizedAthleteProfile = {
    source: input,
    training_age_category: input.fitness_level,
    weekly_training_minutes: weeklyTrainingMinutes,
    programme_horizon_weeks: estimateProgrammeHorizonWeeks(input, weightChange),
    recovery_capacity: estimateRecoveryCapacity(
      input,
      weeklyTrainingMinutes,
      healthFlags,
    ),
    movement_restrictions: injuryRestrictions.movementRestrictions,
    restricted_movement_tags: injuryRestrictions.restrictedMovementTags,
    excluded_exercise_ids: [],
    health_flags: healthFlags,
    assumptions,
    planning_assumptions: planningAssumptions,
    missing_inputs: missingInputs,
    athlete_state: athleteState,
    equipment_capabilities: normalizeEquipmentCapabilities(input),
    programme_confidence: calculateProgrammeConfidence(
      input,
      weightChange,
      healthFlags,
      assumptions,
      missingInputs,
    ),
    resolved_body_fat_pct: resolveBodyFatPct(input),
  };

  const result = NormalizedAthleteProfileSchema.safeParse(profile);
  return result.success ? result.data : (profile as NormalizedAthleteProfile);
};
