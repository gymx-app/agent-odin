import type {
  MovementSlot,
  MovementSlotPriority,
  RepZone,
  SessionKind,
} from './planning.types.js';
import type { MovementPattern } from '../domain/exercise/exercise-taxonomy.js';

const repZoneForPriority = (priority: MovementSlotPriority): RepZone =>
  priority === 'primary'
    ? { min: 6, max: 10 }
    : priority === 'secondary'
      ? { min: 8, max: 12 }
      : { min: 10, max: 15 };

const slot = (
  slot_id: string,
  movement_pattern: MovementPattern,
  priority: MovementSlotPriority,
  required = true,
  allowed_substitution_patterns: MovementPattern[] = [],
): MovementSlot => ({
  slot_id,
  movement_pattern,
  priority,
  required,
  allowed_substitution_patterns,
  set_budget: priority === 'accessory' ? 2 : 3,
  rep_zone: repZoneForPriority(priority),
  target_rpe_range:
    priority === 'primary' ? { min: 6, max: 8 } : { min: 6, max: 7 },
});

export const buildMovementSlotsForSession = (
  sessionKind: SessionKind,
): MovementSlot[] => {
  if (sessionKind === 'full_body') {
    return [
      slot('squat', 'squat', 'primary', true, ['knee_extension_isolation']),
      slot('hinge', 'hinge', 'primary', true, ['knee_flexion_isolation']),
      slot('push', 'horizontal_push', 'secondary', true, ['vertical_push']),
      slot('pull', 'horizontal_pull', 'secondary', true, ['vertical_pull']),
      slot('core', 'core_anti_extension', 'accessory', false, ['carry']),
    ];
  }

  if (sessionKind === 'upper') {
    return [
      slot('horizontal_push', 'horizontal_push', 'primary'),
      slot('horizontal_pull', 'horizontal_pull', 'primary'),
      slot('vertical_push', 'vertical_push', 'secondary', true, [
        'shoulder_abduction',
      ]),
      slot('vertical_pull', 'vertical_pull', 'secondary'),
      slot('elbow_flexion', 'elbow_flexion', 'accessory', false),
      slot('elbow_extension', 'elbow_extension', 'accessory', false, [
        'shoulder_abduction',
      ]),
    ];
  }

  if (sessionKind === 'lower') {
    return [
      slot('squat', 'squat', 'primary', true, ['knee_extension_isolation']),
      slot('hinge', 'hinge', 'primary', true, ['knee_flexion_isolation']),
      slot('knee_flexion', 'knee_flexion_isolation', 'accessory', false),
      slot('knee_extension', 'knee_extension_isolation', 'accessory', false),
      slot('calves', 'calf_raise', 'accessory', false),
      slot('core', 'core_anti_rotation', 'accessory', false, [
        'core_anti_extension',
      ]),
    ];
  }

  if (sessionKind === 'push') {
    return [
      slot('horizontal_push', 'horizontal_push', 'primary'),
      slot('vertical_push', 'vertical_push', 'primary'),
      slot('secondary_push', 'horizontal_push', 'secondary', false),
      slot('shoulder_abduction', 'shoulder_abduction', 'accessory', false),
      slot('elbow_extension', 'elbow_extension', 'accessory', false),
    ];
  }

  if (sessionKind === 'pull') {
    return [
      slot('horizontal_pull', 'horizontal_pull', 'primary'),
      slot('vertical_pull', 'vertical_pull', 'primary'),
      slot('upper_back', 'horizontal_pull', 'secondary', false),
      slot('elbow_flexion', 'elbow_flexion', 'accessory', false),
      slot('carry', 'carry', 'accessory', false),
    ];
  }

  if (sessionKind === 'legs') {
    return [
      slot('squat', 'squat', 'primary', true, ['knee_extension_isolation']),
      slot('hinge', 'hinge', 'primary', true, ['knee_flexion_isolation']),
      slot('knee_flexion', 'knee_flexion_isolation', 'accessory', false),
      slot('knee_extension', 'knee_extension_isolation', 'accessory', false),
      slot('calves', 'calf_raise', 'accessory', false),
      slot('core', 'core_anti_extension', 'accessory', false),
    ];
  }

  return [];
};
