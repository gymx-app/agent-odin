// Maps primary muscle group → stretch exercise from the approved library.
// All exercise_ids must exist in approved-exercise-library.ts — do not invent.
// movement_pattern is used to prevent selecting two stretches for the same pattern in one session.

export type StretchEntry = {
  exercise_id: string;
  activity_name: string;
  // Plain English: position + sensation only. No recovery claims.
  notes: string;
  movement_pattern: string;
};

export const stretchByMuscle: Record<string, StretchEntry> = {
  hamstrings: {
    exercise_id: 'standing_hamstring_stretch',
    activity_name: 'Standing Hamstring Stretch',
    notes: 'Stand tall, straighten one leg forward and hinge at the hip until you feel the pull in the back of your thigh. Switch sides.',
    movement_pattern: 'posterior_chain',
  },
  calves: {
    exercise_id: 'standing_calf_stretch',
    activity_name: 'Standing Calf Stretch',
    notes: 'Step one foot behind you, press the heel flat to the floor and keep the back knee straight until you feel your calf lengthen. Switch sides.',
    movement_pattern: 'posterior_chain',
  },
  quadriceps: {
    exercise_id: 'standing_quad_stretch',
    activity_name: 'Standing Quad Stretch',
    notes: 'Balance on one leg, pull your heel toward your glute and keep your knees together until you feel the front of your thigh pull. Switch sides.',
    movement_pattern: 'anterior_chain',
  },
  glutes: {
    exercise_id: 'pigeon_stretch',
    activity_name: 'Pigeon Stretch',
    notes: 'Place your front shin across the mat at an angle, lower your hips toward the floor and breathe into the pressure in your outer hip. Switch sides.',
    movement_pattern: 'hip',
  },
  adductors: {
    exercise_id: 'pigeon_stretch',
    activity_name: 'Pigeon Stretch',
    notes: 'Place your front shin across the mat at an angle, lower your hips toward the floor and breathe into the pressure in your outer hip. Switch sides.',
    movement_pattern: 'hip',
  },
  chest: {
    exercise_id: 'doorway_chest_stretch',
    activity_name: 'Doorway Chest Stretch',
    notes: 'Place both forearms on a door frame and step one foot through until you feel the pull across your chest and front shoulders.',
    movement_pattern: 'horizontal_push',
  },
  front_delts: {
    exercise_id: 'doorway_chest_stretch',
    activity_name: 'Doorway Chest Stretch',
    notes: 'Place both forearms on a door frame and step one foot through until you feel the pull across your chest and front shoulders.',
    movement_pattern: 'horizontal_push',
  },
  triceps: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with the other hand, keep your shoulder down until you feel the pull in the back of your arm and shoulder. Switch sides.',
    movement_pattern: 'shoulder',
  },
  rear_delts: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with the other hand, keep your shoulder down until you feel the pull in the back of your arm and shoulder. Switch sides.',
    movement_pattern: 'shoulder',
  },
  side_delts: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with the other hand, keep your shoulder down until you feel the pull in the back of your arm and shoulder. Switch sides.',
    movement_pattern: 'shoulder',
  },
  upper_back: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with the other hand, keep your shoulder down until you feel the pull in the back of your arm and shoulder. Switch sides.',
    movement_pattern: 'shoulder',
  },
  lats: {
    exercise_id: 'child_pose',
    activity_name: "Child's Pose",
    notes: "Kneel and reach your arms forward on the floor, lower your hips back toward your heels until you feel a long pull from your hips to your fingertips.",
    movement_pattern: 'spine',
  },
  spinal_erectors: {
    exercise_id: 'child_pose',
    activity_name: "Child's Pose",
    notes: "Kneel and reach your arms forward on the floor, lower your hips back toward your heels until you feel a long pull from your hips to your fingertips.",
    movement_pattern: 'spine',
  },
  abdominals: {
    exercise_id: 'cat_cow',
    activity_name: 'Cat-Cow',
    notes: 'On hands and knees, arch your back up toward the ceiling, then let it drop toward the floor. Move slowly between both positions.',
    movement_pattern: 'spine',
  },
  neck: {
    exercise_id: 'neck_stretch_lateral',
    activity_name: 'Lateral Neck Stretch',
    notes: 'Tilt one ear toward your shoulder and apply gentle pressure with your hand until you feel the pull along the side of your neck. Switch sides.',
    movement_pattern: 'neck',
  },
};

// Always-included thoracic/lower-back anchor regardless of session type.
export const SPINE_ANCHOR_STRETCH: StretchEntry = {
  exercise_id: 'child_pose',
  activity_name: "Child's Pose",
  notes: "Kneel and reach your arms forward on the floor, lower your hips back toward your heels until you feel a long pull from your hips to your fingertips.",
  movement_pattern: 'spine',
};

// Used when no session muscles resolve to library stretches.
export const FALLBACK_STRETCHES: StretchEntry[] = [
  SPINE_ANCHOR_STRETCH,
  {
    exercise_id: 'standing_quad_stretch',
    activity_name: 'Standing Quad Stretch',
    notes: 'Balance on one leg, pull your heel toward your glute and keep your knees together until you feel the front of your thigh pull. Switch sides.',
    movement_pattern: 'anterior_chain',
  },
  {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with the other hand, keep your shoulder down until you feel the pull in the back of your arm and shoulder. Switch sides.',
    movement_pattern: 'shoulder',
  },
];
