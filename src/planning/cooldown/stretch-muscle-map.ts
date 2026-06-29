// Maps muscle group names → the preferred stretch exercise_id from the approved library.
// All IDs must exist in approved-exercise-library.ts — do not invent.
// Where multiple stretches exist for a muscle, pick the most universally accessible one.

export type StretchEntry = {
  exercise_id: string;
  activity_name: string;
  notes: string;
  purpose_suffix: string; // appended to "Releases tension in the {muscle}"
};

export const stretchByMuscle: Record<string, StretchEntry> = {
  hamstrings: {
    exercise_id: 'standing_hamstring_stretch',
    activity_name: 'Standing Hamstring Stretch',
    notes: 'Stand tall, straighten one leg forward and tilt your hips forward until you feel the pull in the back of your thigh. Switch sides.',
    purpose_suffix: 'hamstrings',
  },
  quadriceps: {
    exercise_id: 'standing_quad_stretch',
    activity_name: 'Standing Quad Stretch',
    notes: 'Stand on one leg, pull your heel toward your glute and keep your knees together. Hold, then switch sides.',
    purpose_suffix: 'quadriceps',
  },
  glutes: {
    exercise_id: 'pigeon_stretch',
    activity_name: 'Pigeon Stretch',
    notes: 'Place your front shin across the mat at an angle, lower your hips toward the floor and breathe into the tightness in your outer hip. Switch sides.',
    purpose_suffix: 'glutes',
  },
  adductors: {
    exercise_id: 'pigeon_stretch',
    activity_name: 'Pigeon Stretch',
    notes: 'Place your front shin across the mat at an angle, lower your hips toward the floor and breathe into the tightness in your outer hip. Switch sides.',
    purpose_suffix: 'adductors',
  },
  chest: {
    exercise_id: 'doorway_chest_stretch',
    activity_name: 'Doorway Chest Stretch',
    notes: 'Place both forearms on a door frame, step one foot through and lean forward until you feel a stretch across your chest and front shoulders.',
    purpose_suffix: 'chest',
  },
  front_delts: {
    exercise_id: 'doorway_chest_stretch',
    activity_name: 'Doorway Chest Stretch',
    notes: 'Place both forearms on a door frame, step one foot through and lean forward until you feel a stretch across your chest and front shoulders.',
    purpose_suffix: 'front delts',
  },
  rear_delts: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with your other hand, keep your shoulder down and away from your ear. Switch sides.',
    purpose_suffix: 'rear delts',
  },
  side_delts: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with your other hand, keep your shoulder down and away from your ear. Switch sides.',
    purpose_suffix: 'shoulders',
  },
  upper_back: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with your other hand, keep your shoulder down and away from your ear. Switch sides.',
    purpose_suffix: 'upper back',
  },
  lats: {
    exercise_id: 'child_pose',
    activity_name: "Child's Pose",
    notes: "Kneel and reach both arms forward on the floor, lower your hips back toward your heels and breathe deeply into your lower back and sides.",
    purpose_suffix: 'lats and lower back',
  },
  spinal_erectors: {
    exercise_id: 'child_pose',
    activity_name: "Child's Pose",
    notes: "Kneel and reach both arms forward on the floor, lower your hips back toward your heels and breathe deeply into your lower back and sides.",
    purpose_suffix: 'spinal erectors',
  },
  abdominals: {
    exercise_id: 'cat_cow',
    activity_name: 'Cat-Cow',
    notes: 'On hands and knees, arch your back up to the ceiling, then let it drop toward the floor. Move slowly and breathe through each direction.',
    purpose_suffix: 'core and spine',
  },
  calves: {
    exercise_id: 'standing_calf_stretch',
    activity_name: 'Standing Calf Stretch',
    notes: 'Step one foot behind you and press the heel firmly into the floor. Keep the back knee straight and lean forward slightly until you feel your calf lengthen. Switch sides.',
    purpose_suffix: 'calves',
  },
  neck: {
    exercise_id: 'neck_stretch_lateral',
    activity_name: 'Lateral Neck Stretch',
    notes: 'Tilt your ear toward your shoulder and use a gentle hand pull for more depth. Hold without forcing, then switch sides.',
    purpose_suffix: 'neck',
  },
  triceps: {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with your other hand, keep your shoulder down and away from your ear. Switch sides.',
    purpose_suffix: 'triceps and shoulders',
  },
};

// Used as the universal lower-back/thoracic anchor — always included regardless of session type.
export const SPINE_ANCHOR_STRETCH: StretchEntry = {
  exercise_id: 'child_pose',
  activity_name: "Child's Pose",
  notes: "Kneel and reach both arms forward on the floor, lower your hips back toward your heels and breathe deeply into your lower back and sides.",
  purpose_suffix: 'lower back and thoracic spine',
};

// Fallback set when no muscles can be resolved from the session.
export const FALLBACK_STRETCHES: StretchEntry[] = [
  SPINE_ANCHOR_STRETCH,
  {
    exercise_id: 'standing_quad_stretch',
    activity_name: 'Standing Quad Stretch',
    notes: 'Stand on one leg, pull your heel toward your glute and keep your knees together. Hold, then switch sides.',
    purpose_suffix: 'quadriceps',
  },
  {
    exercise_id: 'cross_body_shoulder_stretch',
    activity_name: 'Cross-Body Shoulder Stretch',
    notes: 'Pull one arm straight across your chest with your other hand, keep your shoulder down and away from your ear. Switch sides.',
    purpose_suffix: 'shoulders and upper back',
  },
];
