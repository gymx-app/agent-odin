import type { WarmupItem, WarmupPlannerInput } from './warmup.types.js';

const hasPattern = (input: WarmupPlannerInput, pattern: string): boolean =>
  input.session.day.exercises.some((exercise) =>
    exercise.movement_patterns.includes(pattern),
  );

const item = (
  input: WarmupPlannerInput,
  order: number,
  suffix: string,
  value: Omit<WarmupItem, 'warmup_id' | 'display_order'>,
): WarmupItem => ({
  warmup_id: `${input.session.day.day_id}-${suffix}`,
  display_order: order,
  ...value,
});

export const buildWarmupComponents = (
  input: WarmupPlannerInput,
): WarmupItem[] => {
  const shortSession = input.profile.source.session_duration_min <= 30;
  const lower = ['lower', 'legs'].includes(
    input.session.day.session_metadata?.session_kind ?? '',
  );
  const upper = ['upper', 'push', 'pull'].includes(
    input.session.day.session_metadata?.session_kind ?? '',
  );
  const power = input.session.day.exercises.some(
    (exercise) => exercise.sequence_role === 'power',
  );
  const clinicianRestrictions = input.profile.movement_restrictions.filter(
    (restriction) => restriction.clinician_restriction,
  );
  const components: WarmupItem[] = [
    item(input, 1, 'pulse', {
      component_type: 'pulse_raiser',
      activity_name: lower ? 'Easy Cycle' : upper ? 'Easy Row' : 'Easy March',
      duration_seconds: shortSession ? 60 : power ? 180 : 120,
      intensity: 'Easy conversational effort',
      purpose: 'Raise body temperature without creating fatigue.',
      rationale_codes: [
        lower
          ? 'LOWER_BODY_PULSE_RAISER_SELECTED'
          : upper
            ? 'UPPER_BODY_PULSE_RAISER_SELECTED'
            : 'GENERAL_PULSE_RAISER_SELECTED',
      ],
    }),
  ];

  if (hasPattern(input, 'hinge')) {
    components.push(
      item(input, components.length + 1, 'hinge-rehearsal', {
        component_type: 'movement_rehearsal',
        activity_name: 'Hip Hinge Rehearsal',
        repetitions: 8,
        intensity: 'Controlled',
        purpose: 'Rehearse the session hinge pattern.',
        rationale_codes: ['HINGE_PATTERN_PREPARED'],
      }),
    );
  }
  if (hasPattern(input, 'squat')) {
    components.push(
      item(input, components.length + 1, 'squat-rehearsal', {
        component_type: 'movement_rehearsal',
        activity_name: 'Squat Pattern Rehearsal',
        repetitions: 8,
        intensity: 'Comfortable range',
        purpose: 'Rehearse the session squat pattern.',
        rationale_codes: ['SQUAT_PATTERN_PREPARED'],
      }),
    );
  }
  if (
    hasPattern(input, 'horizontal_push') ||
    hasPattern(input, 'vertical_push') ||
    hasPattern(input, 'horizontal_pull') ||
    hasPattern(input, 'vertical_pull')
  ) {
    components.push(
      item(input, components.length + 1, 'upper-rehearsal', {
        component_type: 'dynamic_mobility',
        activity_name: 'Controlled Arm Circles',
        repetitions: 8,
        intensity: 'Comfortable range',
        purpose: 'Prepare the shoulders for the selected upper-body patterns.',
        rationale_codes: ['UPPER_BODY_PATTERN_PREPARED'],
      }),
    );
  }

  clinicianRestrictions.forEach((restriction, index) => {
    components.push(
      item(input, components.length + 1, `clinician-mobility-${index + 1}`, {
        component_type: 'targeted_mobility',
        activity_name: 'Brief Clinician-Directed Mobility',
        duration_seconds: 20,
        intensity: 'Gentle, symptom-free range',
        purpose: `Apply clinician-directed preparation for ${restriction.source_area}.`,
        rationale_codes: [
          'CLINICIAN_MOBILITY_REQUIREMENT_APPLIED',
          power
            ? 'STATIC_STRETCH_OMITTED_BEFORE_POWER'
            : 'TARGETED_STATIC_STRETCH_ALLOWED',
        ],
      }),
    );
  });

  return components;
};
