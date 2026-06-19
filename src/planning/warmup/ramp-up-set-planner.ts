import type { WarmupItem, WarmupPlannerInput } from './warmup.types.js';

const rampCount = (input: WarmupPlannerInput): number => {
  const first = [...input.session.day.exercises].sort(
    (left, right) => left.priority - right.priority,
  )[0];
  const metadata = input.exercises.find(
    (exercise) => exercise.id === first?.exercise_id,
  );
  if (input.session.week_type === 'deload') return 1;
  if (
    first?.sequence_role === 'power' ||
    input.session.day.training_budget?.intensity_intent === 'heavy' ||
    (metadata?.skill_demand ?? 0) >= 4
  ) {
    return 3;
  }
  if (
    ['beginner', 'returning'].includes(
      input.profile.athlete_state.training_status.value,
    )
  ) {
    return 2;
  }
  return 2;
};

export const planRampUpSets = (
  input: WarmupPlannerInput,
  startOrder: number,
): WarmupItem[] => {
  const first = [...input.session.day.exercises].sort(
    (left, right) => left.priority - right.priority,
  )[0];
  if (!first) return [];

  const repetitions = [8, 5, 3, 2];
  const intensities = ['Very light', 'Light', 'Moderate', 'Moderately heavy'];

  return Array.from({ length: rampCount(input) }, (_, index) => ({
    warmup_id: `${input.session.day.day_id}-ramp-${index + 1}`,
    display_order: startOrder + index,
    component_type: 'ramp_up_set',
    activity_name: `${first.exercise_name} Ramp-up`,
    repetitions: repetitions[index]!,
    intensity: intensities[index]!,
    purpose: `Prepare specifically for ${first.exercise_name} without creating meaningful fatigue.`,
    related_exercise_id: first.exercise_id,
    rationale_codes: [
      'FIRST_PRIORITY_EXERCISE_RAMP_UP',
      input.session.week_type === 'deload'
        ? 'DELOAD_RAMP_UP_REDUCED'
        : 'RAMP_UP_VOLUME_MATCHED_TO_DEMAND',
    ],
  }));
};
