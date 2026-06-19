import type { MovementPattern } from '../../domain/exercise/exercise-taxonomy.js';
import type { WeekPlannerInput } from '../weeks/week.types.js';
import { CORE_MOVEMENT_PATTERNS } from './volume-policies.js';

const excludedPatterns = (input: WeekPlannerInput): Set<MovementPattern> => {
  const excluded = new Set<MovementPattern>();
  input.profile.movement_restrictions
    .filter((restriction) => restriction.severity === 'avoid')
    .forEach((restriction) => {
      if (
        ['loaded_deep_knee_flexion', 'deep_ankle_dorsiflexion'].includes(
          restriction.tag,
        )
      ) {
        excluded.add('squat');
      }
      if (restriction.tag === 'unsupported_hip_hinge') excluded.add('hinge');
      if (restriction.tag === 'overhead_loading') {
        excluded.add('vertical_push');
      }
      if (restriction.tag === 'high_elbow_flexion_load') {
        excluded.add('elbow_flexion');
      }
      if (restriction.tag === 'high_elbow_extension_load') {
        excluded.add('elbow_extension');
      }
    });
  return excluded;
};

export const budgetMovementPatterns = (
  input: WeekPlannerInput,
  totalSets: number,
): Array<{
  movement_pattern: string;
  set_target: number;
  priority: 'low' | 'moderate' | 'high';
  rationale_codes: string[];
}> => {
  const excluded = excludedPatterns(input);
  const active = CORE_MOVEMENT_PATTERNS.filter(
    (pattern) => !excluded.has(pattern),
  );
  const primary = new Set<MovementPattern>([
    'squat',
    'hinge',
    'horizontal_push',
    'horizontal_pull',
    'vertical_pull',
  ]);
  const result = CORE_MOVEMENT_PATTERNS.map((movement_pattern) => {
    if (excluded.has(movement_pattern)) {
      return {
        movement_pattern,
        set_target: 0,
        priority: 'low' as const,
        rationale_codes: ['MOVEMENT_RESTRICTION_REALLOCATION'],
      };
    }
    return {
      movement_pattern,
      set_target: 0,
      priority: primary.has(movement_pattern)
        ? ('high' as const)
        : ('moderate' as const),
      rationale_codes: [],
    };
  });

  const weightedOrder = [
    ...active.filter((pattern) => primary.has(pattern)),
    ...active,
  ];
  for (let set = 0; set < totalSets && weightedOrder.length > 0; set += 1) {
    const movement = weightedOrder[set % weightedOrder.length]!;
    result.find((item) => item.movement_pattern === movement)!.set_target += 1;
  }
  return result;
};
