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

type SessionCategory = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body';

const sessionCategory = (input: WarmupPlannerInput): SessionCategory => {
  const kind = input.session.day.session_metadata?.session_kind ?? '';
  if (kind === 'push') return 'push';
  if (kind === 'pull') return 'pull';
  if (kind === 'legs' || kind === 'lower') return 'legs';
  if (kind === 'upper') return 'upper';
  return 'full_body';
};

const dynamicMobilityForSession = (
  input: WarmupPlannerInput,
  order: number,
): WarmupItem[] => {
  const category = sessionCategory(input);
  const items: WarmupItem[] = [];

  if (category === 'push' || category === 'upper') {
    items.push(
      item(input, order, 'shoulder-mob', {
        component_type: 'dynamic_mobility',
        activity_name: 'Wall Slides',
        exercise_id: 'wall_slide',
        repetitions: 8,
        intensity: 'Controlled, full range',
        purpose: 'Open the shoulder girdle and prepare scapular mechanics for pressing.',
        rationale_codes: ['PUSH_SHOULDER_MOBILITY_PREPARED'],
      }),
    );
  }
  if (category === 'pull' || category === 'upper') {
    items.push(
      item(input, order + items.length, 'thoracic-mob', {
        component_type: 'dynamic_mobility',
        activity_name: 'Thoracic Spine Rotation',
        exercise_id: 'thoracic_spine_rotation',
        repetitions: 8,
        intensity: 'Controlled, gentle end-range',
        purpose: 'Prepare thoracic extension and rotation for pulling mechanics.',
        rationale_codes: ['PULL_THORACIC_MOBILITY_PREPARED'],
      }),
    );
  }
  if (category === 'legs' || category === 'full_body') {
    items.push(
      item(input, order + items.length, 'hip-mob', {
        component_type: 'dynamic_mobility',
        activity_name: 'Leg Swings',
        exercise_id: 'leg_swing',
        repetitions: 10,
        intensity: 'Controlled, progressively wider',
        purpose: 'Open the hip capsule and prepare lower body range for squatting and hinging.',
        rationale_codes: ['LOWER_HIP_MOBILITY_PREPARED'],
      }),
    );
  }
  if (category === 'full_body') {
    items.push(
      item(input, order + items.length, 'shoulder-rotation', {
        component_type: 'dynamic_mobility',
        activity_name: 'Shoulder Dislocate',
        exercise_id: 'shoulder_dislocate',
        repetitions: 8,
        intensity: 'Controlled, comfortable range',
        purpose: 'Prepare the shoulders for the upper body portion of the session.',
        rationale_codes: ['FULL_BODY_SHOULDER_PREPARED'],
      }),
    );
  }

  return items;
};

const activationForSession = (
  input: WarmupPlannerInput,
  order: number,
): WarmupItem[] => {
  const category = sessionCategory(input);
  const items: WarmupItem[] = [];

  if (category === 'push' || category === 'upper') {
    items.push(
      item(input, order, 'scap-activation', {
        component_type: 'activation',
        activity_name: 'Band Pull-Apart',
        exercise_id: 'band_pull_apart',
        repetitions: 12,
        intensity: 'Light resistance, squeeze at end range',
        purpose: 'Activate scapular retractors to stabilise the shoulder during pressing.',
        rationale_codes: ['PUSH_SCAPULAR_ACTIVATION_APPLIED'],
      }),
    );
  }
  if (category === 'pull') {
    items.push(
      item(input, order + items.length, 'rotator-activation', {
        component_type: 'activation',
        activity_name: 'Banded Face Pull',
        exercise_id: 'banded_face_pull',
        repetitions: 12,
        intensity: 'Light resistance, controlled',
        purpose: 'Activate rear deltoids and external rotators before pulling.',
        rationale_codes: ['PULL_ROTATOR_ACTIVATION_APPLIED'],
      }),
    );
  }
  if (category === 'legs' || category === 'lower' || category === 'full_body') {
    items.push(
      item(input, order + items.length, 'glute-activation', {
        component_type: 'activation',
        activity_name: 'Glute Bridge',
        exercise_id: 'bodyweight_glute_bridge',
        repetitions: 10,
        intensity: 'Bodyweight, 2-second hold at top',
        purpose: 'Activate glutes to ensure proper hip drive during squats and hinges.',
        rationale_codes: ['LOWER_GLUTE_ACTIVATION_APPLIED'],
      }),
    );
  }

  return items;
};

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
  const pulseExercise = lower
    ? { name: 'Stationary Bike', id: 'stationary_bike' }
    : upper
      ? { name: 'Rower LISS', id: 'rower_liss' }
      : { name: 'Treadmill Walk', id: 'treadmill_walk' };
  const components: WarmupItem[] = [
    item(input, 1, 'pulse', {
      component_type: 'pulse_raiser',
      activity_name: pulseExercise.name,
      exercise_id: pulseExercise.id,
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

  const mobility = dynamicMobilityForSession(input, components.length + 1);
  components.push(...mobility);

  const activation = shortSession
    ? []
    : activationForSession(input, components.length + 1);
  components.push(...activation);

  if (hasPattern(input, 'hinge')) {
    components.push(
      item(input, components.length + 1, 'hinge-rehearsal', {
        component_type: 'movement_rehearsal',
        activity_name: 'Glute Bridge',
        exercise_id: 'bodyweight_glute_bridge',
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
        activity_name: 'Bodyweight Squat',
        exercise_id: 'bodyweight_squat',
        repetitions: 8,
        intensity: 'Comfortable range',
        purpose: 'Rehearse the session squat pattern.',
        rationale_codes: ['SQUAT_PATTERN_PREPARED'],
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
