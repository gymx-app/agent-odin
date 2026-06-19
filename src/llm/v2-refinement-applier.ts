import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { Exercise } from '../domain/exercise/exercise.types.js';
import { LongitudinalOdinProgrammeSchema } from '../domain/programme/longitudinal-programme.schema.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { evaluateExerciseEligibility } from '../exercises/eligibility.js';
import type { V2RefinementProposal } from './v2-refinement.types.js';
import { refinementError } from './refinement-errors.js';

const difficultyRank = { beginner: 1, intermediate: 2, advanced: 3 } as const;

const roleRank: Record<string, number> = {
  power: 0,
  primary: 1,
  secondary: 2,
  accessory: 3,
  isolation: 4,
  core: 5,
};

const interferenceRank: Record<string, number> = {
  low: 0,
  moderate: 1,
  high: 2,
  unacceptable: 3,
};

type Day =
  LongitudinalOdinProgramme['phases'][number]['weeks'][number]['days'][number];
type ExercisePrescription = Day['exercises'][number];
type ConditioningPrescription = Day['conditioning'][number];

const findExercise = (
  programme: LongitudinalOdinProgramme,
  prescriptionId: string,
): { exercise: ExercisePrescription; day: Day } | undefined => {
  for (const phase of programme.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        const exercise = day.exercises.find(
          (item) => item.prescription_id === prescriptionId,
        );
        if (exercise) return { exercise, day };
      }
    }
  }
  return undefined;
};

const findConditioning = (
  programme: LongitudinalOdinProgramme,
  conditioningId: string,
): { conditioning: ConditioningPrescription; day: Day } | undefined => {
  for (const phase of programme.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        const conditioning = day.conditioning.find(
          (item) => item.conditioning_id === conditioningId,
        );
        if (conditioning) return { conditioning, day };
      }
    }
  }
  return undefined;
};

const findWarmup = (
  programme: LongitudinalOdinProgramme,
  warmupId: string,
): { warmup: Day['warmup'][number]; day: Day } | undefined => {
  for (const phase of programme.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        const warmup = day.warmup.find((item) => item.warmup_id === warmupId);
        if (warmup) return { warmup, day };
      }
    }
  }
  return undefined;
};

const isOptionalRole = (role: string): boolean =>
  role === 'accessory' || role === 'isolation' || role === 'core';

const equipmentAvailable = (
  exerciseEquipment: string[],
  athleteEquipment: string,
): boolean => {
  const noEquipNeeded = (equip: string) => equip === 'bodyweight';
  if (athleteEquipment === 'full_gym') return true;
  if (athleteEquipment === 'bodyweight')
    return exerciseEquipment.every(noEquipNeeded);
  if (athleteEquipment === 'dumbbells_only')
    return exerciseEquipment.every(
      (equip) => noEquipNeeded(equip) || equip === 'dumbbell',
    );
  if (athleteEquipment === 'home_gym')
    return exerciseEquipment.every(
      (equip) =>
        noEquipNeeded(equip) ||
        equip === 'dumbbell' ||
        equip === 'resistance_band' ||
        equip === 'bench',
    );
  if (athleteEquipment === 'hotel_gym')
    return exerciseEquipment.every(
      (equip) =>
        noEquipNeeded(equip) ||
        equip === 'dumbbell' ||
        equip === 'machine' ||
        equip === 'treadmill' ||
        equip === 'bike',
    );
  return false;
};

const estimateSessionDuration = (day: Day): number => {
  let totalSeconds = 0;
  for (const warmup of day.warmup) {
    totalSeconds += warmup.duration_seconds ?? (warmup.repetitions ?? 0) * 5;
  }
  for (const exercise of day.exercises) {
    const execSeconds = exercise.sets.length * 40;
    const restSeconds = exercise.sets.reduce(
      (sum, set) => sum + set.rest_seconds,
      0,
    );
    totalSeconds += execSeconds + restSeconds + 90;
  }
  for (const conditioning of day.conditioning) {
    totalSeconds += conditioning.duration_min * 60;
  }
  for (const cooldown of day.cooldown) {
    totalSeconds +=
      cooldown.duration_seconds ?? (cooldown.repetitions ?? 0) * 5;
  }
  return Math.ceil(totalSeconds / 60);
};

type OperationItem = V2RefinementProposal['operations'][number];

const applyReplaceExercise = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<OperationItem, { operation_type: 'replace_exercise' }>,
  exerciseById: Map<string, Exercise>,
  profile: NormalizedAthleteProfile,
): void => {
  const match = findExercise(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Replace exercise target not found.',
      { operation_id: operation.operation_id },
    );
  }
  const { exercise: prescription, day } = match;
  const replacement = exerciseById.get(operation.replacement_id);
  const current = exerciseById.get(prescription.exercise_id);
  if (!replacement || !current) {
    throw refinementError(
      'REFINEMENT_EXERCISE_UNKNOWN',
      'Replacement or current exercise not in approved library.',
      { operation_id: operation.operation_id },
    );
  }
  const approvedCandidates =
    prescription.substitution_options?.approved_exercise_ids ?? [];
  if (!approvedCandidates.includes(replacement.id)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement not in approved candidates.',
      { operation_id: operation.operation_id },
    );
  }
  if (evaluateExerciseEligibility(replacement, profile).status !== 'eligible') {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement exercise is not eligible.',
      { operation_id: operation.operation_id },
    );
  }
  if (
    difficultyRank[replacement.difficulty] >
    difficultyRank[profile.source.fitness_level]
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement exceeds athlete difficulty level.',
      { operation_id: operation.operation_id },
    );
  }
  if (!equipmentAvailable(replacement.equipment, profile.source.equipment)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement requires unavailable equipment.',
      { operation_id: operation.operation_id },
    );
  }
  if (
    !replacement.movement_patterns.some((pattern) =>
      current.movement_patterns.includes(pattern),
    )
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement does not preserve movement role.',
      { operation_id: operation.operation_id },
    );
  }
  if (
    !replacement.primary_muscles.some((muscle) =>
      current.primary_muscles.includes(muscle),
    )
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement does not preserve muscle intent.',
      { operation_id: operation.operation_id },
    );
  }
  if (
    day.exercises.some(
      (candidate) =>
        candidate.prescription_id !== prescription.prescription_id &&
        candidate.exercise_id === replacement.id,
    )
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Replacement would create a duplicate exercise.',
      { operation_id: operation.operation_id },
    );
  }

  prescription.exercise_id = replacement.id;
  prescription.exercise_name = replacement.name;
  prescription.equipment = replacement.equipment;
  prescription.movement_patterns = replacement.movement_patterns;
  prescription.primary_muscles = replacement.primary_muscles;
  prescription.secondary_muscles = replacement.secondary_muscles;
};

const applyRemoveOptionalExercise = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<
    OperationItem,
    { operation_type: 'remove_optional_exercise' }
  >,
): void => {
  const match = findExercise(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Remove exercise target not found.',
      { operation_id: operation.operation_id },
    );
  }
  if (!isOptionalRole(match.exercise.sequence_role)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Only optional exercises (accessory, isolation, core) can be removed.',
      { operation_id: operation.operation_id },
    );
  }
  match.day.exercises = match.day.exercises.filter(
    (item) => item.prescription_id !== operation.target_id,
  );
};

const applyReduceOptionalSets = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<OperationItem, { operation_type: 'reduce_optional_sets' }>,
): void => {
  const match = findExercise(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Reduce sets target not found.',
      { operation_id: operation.operation_id },
    );
  }
  if (!isOptionalRole(match.exercise.sequence_role)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Only optional exercises may have sets reduced.',
      { operation_id: operation.operation_id },
    );
  }
  const currentCount = match.exercise.sets.length;
  if (operation.new_value >= currentCount) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'New set count must be less than current.',
      { operation_id: operation.operation_id },
    );
  }
  if (operation.new_value < 1) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Must retain at least one set.',
      { operation_id: operation.operation_id },
    );
  }
  match.exercise.sets = match.exercise.sets.slice(0, operation.new_value);
};

const applyReorderExercise = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<OperationItem, { operation_type: 'reorder_exercise' }>,
  exerciseById: Map<string, Exercise>,
): void => {
  const match = findExercise(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Reorder exercise target not found.',
      { operation_id: operation.operation_id },
    );
  }
  const { exercise: target, day } = match;
  target.display_order = operation.new_value;
  day.exercises.sort(
    (left, right) =>
      left.display_order - right.display_order ||
      left.prescription_id.localeCompare(right.prescription_id),
  );
  day.exercises.forEach((exercise, index) => {
    exercise.display_order = index;
  });

  const exerciseIds = day.exercises.map((item) => item.exercise_id);
  if (new Set(exerciseIds).size !== exerciseIds.length) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Reorder created duplicate exercises.',
      { operation_id: operation.operation_id },
    );
  }

  const roles = day.exercises.map((item) => item.sequence_role);
  for (let i = 0; i < roles.length - 1; i++) {
    const currentRank = roleRank[roles[i]!] ?? 5;
    const nextRank = roleRank[roles[i + 1]!] ?? 5;
    if (currentRank > nextRank + 1) {
      const currentType = exerciseById.get(
        day.exercises[i]!.exercise_id,
      )?.exercise_type;
      const nextType = exerciseById.get(
        day.exercises[i + 1]!.exercise_id,
      )?.exercise_type;
      if (currentType === 'isolation' && nextType === 'compound') {
        throw refinementError(
          'REFINEMENT_OPERATION_FORBIDDEN',
          'Reorder violates priority and fatigue sequencing.',
          { operation_id: operation.operation_id },
        );
      }
    }
  }

  const powerIndex = roles.indexOf('power');
  if (powerIndex > 0) {
    const highFatigueBeforePower = day.exercises
      .slice(0, powerIndex)
      .some((item) => {
        const exerciseInfo = exerciseById.get(item.exercise_id);
        return (
          exerciseInfo &&
          (exerciseInfo.fatigue_cost.systemic >= 3 ||
            exerciseInfo.fatigue_cost.local >= 3)
        );
      });
    if (highFatigueBeforePower) {
      throw refinementError(
        'REFINEMENT_OPERATION_FORBIDDEN',
        'Reorder places fatiguing work before power exercise.',
        { operation_id: operation.operation_id },
      );
    }
  }
};

const applyMoveConditioning = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<OperationItem, { operation_type: 'move_conditioning' }>,
): void => {
  const match = findConditioning(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Move conditioning target not found.',
      { operation_id: operation.operation_id },
    );
  }
  const newPlacement = operation.new_value;
  const validPlacements = [
    'standalone',
    'before_resistance',
    'after_resistance',
    'same_day_separate_session',
    'sport_session',
    'movement_target',
  ];
  if (!validPlacements.includes(newPlacement)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Invalid conditioning placement.',
      { operation_id: operation.operation_id },
    );
  }
  const oldInterference =
    interferenceRank[match.conditioning.interference_risk] ?? 0;
  match.conditioning.placement =
    newPlacement as ConditioningPrescription['placement'];
  if (
    newPlacement === 'before_resistance' &&
    match.day.day_type === 'combined'
  ) {
    if (match.conditioning.interference_risk === 'low') {
      match.conditioning.interference_risk = 'moderate';
    }
  }
  const newInterference =
    interferenceRank[match.conditioning.interference_risk] ?? 0;
  if (newInterference > oldInterference) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Conditioning move worsens interference risk.',
      { operation_id: operation.operation_id },
    );
  }
  if (newPlacement === 'same_day_separate_session') {
    match.conditioning.same_day_separation = {
      category: '6_to_12_hours',
    };
  } else if (match.conditioning.same_day_separation) {
    delete (match.conditioning as Record<string, unknown>)[
      'same_day_separation'
    ];
  }
};

const applyReduceConditioningDuration = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<
    OperationItem,
    { operation_type: 'reduce_conditioning_duration' }
  >,
): void => {
  const match = findConditioning(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Reduce conditioning duration target not found.',
      { operation_id: operation.operation_id },
    );
  }
  if (operation.new_value >= match.conditioning.duration_min) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'New duration must be less than current.',
      { operation_id: operation.operation_id },
    );
  }
  if (operation.new_value <= 0) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Duration must remain positive.',
      { operation_id: operation.operation_id },
    );
  }
  match.conditioning.duration_min = operation.new_value;
};

const applyReplaceConditioningModality = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<
    OperationItem,
    { operation_type: 'replace_conditioning_modality' }
  >,
  profile: NormalizedAthleteProfile,
): void => {
  const match = findConditioning(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Replace conditioning modality target not found.',
      { operation_id: operation.operation_id },
    );
  }
  const approved = programme.conditioning_policy.preferred_modalities;
  const restricted = programme.conditioning_policy.restricted_modalities;
  if (!approved.includes(operation.replacement_id)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Modality not in approved list.',
      { operation_id: operation.operation_id },
    );
  }
  if (restricted.includes(operation.replacement_id)) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Modality is restricted.',
      { operation_id: operation.operation_id },
    );
  }
  const impactRestricted = profile.movement_restrictions.some(
    (restriction) =>
      restriction.tag === 'high_impact' && restriction.severity === 'avoid',
  );
  const highImpactModalities = ['running', 'sled', 'assault_bike'];
  if (
    impactRestricted &&
    highImpactModalities.includes(operation.replacement_id)
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Modality violates impact restriction.',
      { operation_id: operation.operation_id },
    );
  }
  match.conditioning.activity_id =
    operation.replacement_id as ConditioningPrescription['activity_id'];
  match.conditioning.activity_name = operation.replacement_id
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c: string) => c.toUpperCase());
};

const applyReplaceOptionalWarmupComponent = (
  programme: LongitudinalOdinProgramme,
  operation: Extract<
    OperationItem,
    { operation_type: 'replace_optional_warmup_component' }
  >,
): void => {
  const match = findWarmup(programme, operation.target_id);
  if (!match) {
    throw refinementError(
      'REFINEMENT_REFERENCE_INVALID',
      'Warmup component not found.',
      { operation_id: operation.operation_id },
    );
  }
  if (
    match.warmup.component_type === 'pulse_raiser' ||
    match.warmup.component_type === 'ramp_up_set'
  ) {
    throw refinementError(
      'REFINEMENT_OPERATION_FORBIDDEN',
      'Pulse raisers and ramp-up sets cannot be replaced.',
      { operation_id: operation.operation_id },
    );
  }
  match.warmup.activity_name =
    operation.new_value ??
    operation.replacement_id
      .replaceAll('_', ' ')
      .replace(/\b\w/g, (c: string) => c.toUpperCase());
};

const recalculateDisplayOrders = (
  programme: LongitudinalOdinProgramme,
): void => {
  for (const phase of programme.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        day.exercises.forEach((exercise, index) => {
          exercise.display_order = index;
        });
        day.warmup.forEach((item, index) => {
          item.display_order = index + 1;
        });
        day.conditioning.forEach((item, index) => {
          item.display_order = index + 1;
        });
        day.cooldown.forEach((item, index) => {
          item.display_order = index + 1;
        });
        if (day.day_type !== 'rest') {
          day.estimated_duration_min = estimateSessionDuration(day);
        }
      }
    }
  }
};

export const applyV2ProgrammeRefinement = (
  baseline: LongitudinalOdinProgramme,
  proposal: V2RefinementProposal,
  exercises: Exercise[],
  profile: NormalizedAthleteProfile,
): LongitudinalOdinProgramme => {
  if (baseline.schema_version !== '2.0') {
    throw refinementError(
      'REFINEMENT_PROGRAMME_VERSION_UNSUPPORTED',
      'V2 refinement operations require schema version 2.0.',
    );
  }

  const programme = structuredClone(baseline);
  const exerciseById = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );

  for (const operation of proposal.operations) {
    switch (operation.operation_type) {
      case 'replace_exercise':
        applyReplaceExercise(programme, operation, exerciseById, profile);
        break;
      case 'remove_optional_exercise':
        applyRemoveOptionalExercise(programme, operation);
        break;
      case 'reduce_optional_sets':
        applyReduceOptionalSets(programme, operation);
        break;
      case 'reorder_exercise':
        applyReorderExercise(programme, operation, exerciseById);
        break;
      case 'move_conditioning':
        applyMoveConditioning(programme, operation);
        break;
      case 'reduce_conditioning_duration':
        applyReduceConditioningDuration(programme, operation);
        break;
      case 'replace_conditioning_modality':
        applyReplaceConditioningModality(programme, operation, profile);
        break;
      case 'replace_optional_warmup_component':
        applyReplaceOptionalWarmupComponent(programme, operation);
        break;
      default: {
        const _exhaustive: never = operation;
        throw refinementError(
          'REFINEMENT_OPERATION_UNSUPPORTED',
          'Unsupported V2 operation type.',
          {
            operation_id: (_exhaustive as { operation_id: string })
              .operation_id,
          },
        );
      }
    }
  }

  recalculateDisplayOrders(programme);

  const parsed = LongitudinalOdinProgrammeSchema.safeParse(programme);
  if (!parsed.success) {
    throw refinementError(
      'REFINEMENT_APPLICATION_FAILED',
      'Refined V2 programme does not satisfy the programme schema.',
      { issues: parsed.error.issues.map((issue) => issue.message) },
    );
  }

  return parsed.data;
};
