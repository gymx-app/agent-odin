import type {
  MovementPattern,
  MuscleGroup,
} from '../../domain/exercise/exercise-taxonomy.js';
import type { WeekPlannerInput } from '../weeks/week.types.js';
import { INDIRECT_SET_CREDIT_FACTOR } from '../evidence.js';
import type { budgetMuscleGroups } from './muscle-volume-budgeter.js';
import { CORE_MOVEMENT_PATTERNS, MOVEMENT_MUSCLE_MAP } from './volume-policies.js';

type MuscleTargets = ReturnType<typeof budgetMuscleGroups>;

export type MovementPatternBudget = {
  movement_pattern: string;
  set_target: number;
  priority: 'low' | 'moderate' | 'high';
  rationale_codes: string[];
};

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

// The first muscle listed for a pattern in MOVEMENT_MUSCLE_MAP is its
// primary target (e.g. quadriceps for squat); any others are trained
// indirectly (e.g. glutes on a squat).
const primaryMuscle = (pattern: MovementPattern): MuscleGroup | undefined =>
  MOVEMENT_MUSCLE_MAP[pattern][0];
const indirectMuscles = (pattern: MovementPattern): MuscleGroup[] =>
  MOVEMENT_MUSCLE_MAP[pattern].slice(1);

// How many active sets a pattern "demands" based on the muscle it
// primarily trains — patterns whose primary muscle has a higher weekly
// target get proportionally more of the week's sets, instead of every
// active pattern getting an even turn regardless of what it actually
// trains. Indirect muscles are deliberately excluded here: they're
// credited separately via computeIndirectSetCredit, and folding their
// demand into this weight too would double-count it (the compound
// pattern would get extra sets to "serve" the indirect muscle, and that
// muscle would then also receive bonus credit from those same sets).
const patternDemandWeight = (
  pattern: MovementPattern,
  targetByMuscle: Map<string, number>,
  primaryPatternCountByMuscle: Map<string, number>,
): number => {
  const primary = primaryMuscle(pattern);
  return primary
    ? (targetByMuscle.get(primary) ?? 0) /
        Math.max(1, primaryPatternCountByMuscle.get(primary) ?? 1)
    : 0;
};

// Largest-remainder allocation: gives each pattern its floor share, then
// distributes the leftover sets to whichever patterns have the largest
// fractional remainder, so the total always sums to exactly totalSets.
const allocateByWeight = (
  patterns: MovementPattern[],
  weights: Map<MovementPattern, number>,
  totalSets: number,
): Map<MovementPattern, number> => {
  const totalWeight = patterns.reduce(
    (sum, pattern) => sum + (weights.get(pattern) ?? 0),
    0,
  );
  const shares = patterns.map((pattern) => ({
    pattern,
    raw:
      totalWeight > 0
        ? ((weights.get(pattern) ?? 0) / totalWeight) * totalSets
        : totalSets / Math.max(1, patterns.length),
  }));
  const allocation = new Map<MovementPattern, number>(
    shares.map(({ pattern, raw }) => [pattern, Math.floor(raw)]),
  );
  const allocated = [...allocation.values()].reduce((sum, n) => sum + n, 0);
  const remainders = shares
    .map(({ pattern, raw }) => ({ pattern, remainder: raw - Math.floor(raw) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; i < totalSets - allocated && remainders.length > 0; i += 1) {
    const { pattern } = remainders[i % remainders.length]!;
    allocation.set(pattern, (allocation.get(pattern) ?? 0) + 1);
  }
  return allocation;
};

export const budgetMovementPatterns = (
  input: WeekPlannerInput,
  totalSets: number,
  muscleTargets: MuscleTargets,
): MovementPatternBudget[] => {
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

  const targetByMuscle = new Map(
    muscleTargets.map((target) => [target.muscle_group, target.direct_set_target]),
  );
  const primaryPatternCountByMuscle = new Map<string, number>();
  CORE_MOVEMENT_PATTERNS.forEach((pattern) => {
    const muscle = primaryMuscle(pattern);
    if (muscle) {
      primaryPatternCountByMuscle.set(
        muscle,
        (primaryPatternCountByMuscle.get(muscle) ?? 0) + 1,
      );
    }
  });

  const weights = new Map(
    active.map((pattern) => [
      pattern,
      patternDemandWeight(pattern, targetByMuscle, primaryPatternCountByMuscle),
    ]),
  );
  const allocation = allocateByWeight(active, weights, totalSets);

  return CORE_MOVEMENT_PATTERNS.map((movement_pattern) => {
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
      set_target: allocation.get(movement_pattern) ?? 0,
      priority: primary.has(movement_pattern)
        ? ('high' as const)
        : ('moderate' as const),
      rationale_codes: ['MUSCLE_DEMAND_WEIGHTED_ALLOCATION'],
    };
  });
};

// Sets each muscle receives as the primary target of its allocated
// patterns — the same accounting the validator uses to check delivered
// volume against a muscle's bounds (see week-validator.ts).
export const primaryDeliveredSetsByMuscle = (
  patternBudgets: MovementPatternBudget[],
): Record<string, number> => {
  const delivered: Record<string, number> = {};
  patternBudgets.forEach(({ movement_pattern, set_target }) => {
    const primary = primaryMuscle(movement_pattern as MovementPattern);
    if (primary) {
      delivered[primary] = (delivered[primary] ?? 0) + set_target;
    }
  });
  return delivered;
};

// For each muscle, sum the indirect credit it earns from patterns where
// it's a secondary (non-primary) target — the real, computed
// counterpart to what used to be a hardcoded indirect_set_credit: 0.
export const computeIndirectSetCredit = (
  patternBudgets: MovementPatternBudget[],
): Record<string, number> => {
  const credit: Record<string, number> = {};
  patternBudgets.forEach(({ movement_pattern, set_target }) => {
    indirectMuscles(movement_pattern as MovementPattern).forEach((muscle) => {
      credit[muscle] =
        (credit[muscle] ?? 0) + set_target * INDIRECT_SET_CREDIT_FACTOR;
    });
  });
  Object.keys(credit).forEach((muscle) => {
    credit[muscle] = Math.round(credit[muscle]!);
  });
  return credit;
};
