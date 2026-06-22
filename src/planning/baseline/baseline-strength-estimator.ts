import type {
  BaselineAssessmentInput,
  BaselineAssessmentResult,
  BaselineEstimate,
  FitnessTier,
  MovementPattern,
} from '../../domain/athlete/baseline-assessment.schema.js';
import {
  UNTRAINED_STRENGTH_RATIOS,
  NOVICE_STRENGTH_RATIOS,
  INTERMEDIATE_STRENGTH_RATIOS,
  PUSHUP_NORMS,
  FITNESS_TIER_ADJUSTMENTS,
  AGE_DECLINE_PER_DECADE_AFTER_40,
  BASELINE_ASSESSMENT_CITATIONS,
  STRENGTH_RATIO_CITATIONS,
  PUSHUP_NORM_CITATIONS,
} from '../evidence.js';

const MOVEMENT_PATTERNS: MovementPattern[] = [
  'squat',
  'hip_hinge',
  'horizontal_push',
  'horizontal_pull',
  'vertical_push',
  'vertical_pull',
];

type PushupNormBracket = keyof typeof PUSHUP_NORMS.male;

const ageBracket = (age: number): PushupNormBracket => {
  if (age < 20) return '16-19';
  if (age < 30) return '20-29';
  if (age < 40) return '30-39';
  if (age < 50) return '40-49';
  if (age < 60) return '50-59';
  return '60+';
};

const ageDeclineFactor = (age: number): number => {
  if (age <= 40) return 1.0;
  const decadesPast40 = (age - 40) / 10;
  return Math.max(0.7, 1.0 - decadesPast40 * AGE_DECLINE_PER_DECADE_AFTER_40);
};

const classifyPushups = (
  reps: number,
  sex: 'male' | 'female',
  age: number,
): FitnessTier => {
  const bracket = ageBracket(age);
  const norms = PUSHUP_NORMS[sex][bracket];
  if (reps >= norms.excellent) return 'excellent';
  if (reps >= norms.above_average) return 'above_average';
  if (reps >= norms.average) return 'average';
  if (reps >= norms.below_average) return 'below_average';
  return 'poor';
};

const classifySquats60s = (reps: number): FitnessTier => {
  if (reps >= 40) return 'excellent';
  if (reps >= 30) return 'above_average';
  if (reps >= 20) return 'average';
  if (reps >= 10) return 'below_average';
  return 'poor';
};

const classifyDeadHang = (seconds: number, sex: 'male' | 'female'): FitnessTier => {
  const thresholds = sex === 'male'
    ? { excellent: 60, above_average: 40, average: 25, below_average: 10 }
    : { excellent: 40, above_average: 25, average: 15, below_average: 5 };
  if (seconds >= thresholds.excellent) return 'excellent';
  if (seconds >= thresholds.above_average) return 'above_average';
  if (seconds >= thresholds.average) return 'average';
  if (seconds >= thresholds.below_average) return 'below_average';
  return 'poor';
};

const TIER_RANK: Record<FitnessTier, number> = {
  poor: 0,
  below_average: 1,
  average: 2,
  above_average: 3,
  excellent: 4,
};

const tierFromRank = (rank: number): FitnessTier => {
  if (rank <= 0) return 'poor';
  if (rank <= 1) return 'below_average';
  if (rank <= 2) return 'average';
  if (rank <= 3) return 'above_average';
  return 'excellent';
};

const compositeFitnessTier = (
  tiers: { tier: FitnessTier; weight: number }[],
): FitnessTier => {
  const totalWeight = tiers.reduce((sum, t) => sum + t.weight, 0);
  const weightedRank =
    tiers.reduce((sum, t) => sum + TIER_RANK[t.tier] * t.weight, 0) / totalWeight;
  return tierFromRank(Math.round(weightedRank));
};

// Epley formula: 1RM = weight × (1 + reps / 30)
const epley1RM = (weight: number, reps: number): number => {
  if (reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

const strengthRatiosForStatus = (
  trainingStatus: 'beginner' | 'intermediate' | 'advanced',
) => {
  switch (trainingStatus) {
    case 'advanced':
    case 'intermediate':
      return INTERMEDIATE_STRENGTH_RATIOS;
    default:
      return UNTRAINED_STRENGTH_RATIOS;
  }
};

export const estimateBaselineStrength = (
  input: BaselineAssessmentInput,
  trainingStatus?: 'beginner' | 'intermediate' | 'advanced' | 'returning' | 'unknown',
): BaselineAssessmentResult => {
  const status = trainingStatus ?? 'beginner';
  const isExperienced = status === 'intermediate' || status === 'advanced';
  const hasFieldTests = !!input.field_tests;
  const knownLifts = input.known_lifts ?? [];

  // Determine fitness tier from field tests
  let fitnessTier: FitnessTier = 'average';
  const tierComponents: { tier: FitnessTier; weight: number }[] = [];

  if (hasFieldTests) {
    const ft = input.field_tests!;
    tierComponents.push({
      tier: classifyPushups(ft.pushup_reps, input.sex, input.age),
      weight: 2,
    });
    tierComponents.push({
      tier: classifySquats60s(ft.bodyweight_squat_reps_60s),
      weight: 2,
    });
    tierComponents.push({
      tier: classifyDeadHang(ft.dead_hang_seconds, input.sex),
      weight: 1,
    });
    fitnessTier = compositeFitnessTier(tierComponents);
  }

  // Build known lift map for O(1) lookup
  const knownLiftMap = new Map(
    knownLifts.map((lift) => [
      lift.movement_pattern,
      epley1RM(lift.weight_kg, lift.reps),
    ]),
  );

  // Select appropriate ratio table
  const ratios = isExperienced
    ? (status === 'advanced'
        ? INTERMEDIATE_STRENGTH_RATIOS
        : NOVICE_STRENGTH_RATIOS)
    : UNTRAINED_STRENGTH_RATIOS;

  const ageFactor = ageDeclineFactor(input.age);
  const tierAdjustment = hasFieldTests
    ? FITNESS_TIER_ADJUSTMENTS[fitnessTier]
    : 1.0;

  const estimates: BaselineEstimate[] = MOVEMENT_PATTERNS.map((pattern) => {
    // Known lift takes priority — highest confidence
    const knownRM = knownLiftMap.get(pattern);
    if (knownRM !== undefined) {
      return {
        movement_pattern: pattern,
        estimated_1rm_kg: Math.round(knownRM * 10) / 10,
        source: 'known_lift' as const,
        confidence: 'high' as const,
        rationale_codes: ['EPLEY_1985_PREDICTION', 'KNOWN_LIFT_PROVIDED'],
      };
    }

    // Field-test-adjusted ratio estimate
    const baseRatio = ratios[input.sex][pattern];
    const adjusted = baseRatio * tierAdjustment * ageFactor;
    const estimated1RM = Math.round(input.bodyweight_kg * adjusted * 10) / 10;

    return {
      movement_pattern: pattern,
      estimated_1rm_kg: Math.max(5, estimated1RM),
      source: hasFieldTests ? ('field_test' as const) : ('ratio_default' as const),
      confidence: hasFieldTests ? ('moderate' as const) : ('low' as const),
      rationale_codes: [
        ...STRENGTH_RATIO_CITATIONS,
        ...(hasFieldTests ? PUSHUP_NORM_CITATIONS : []),
        ...(ageFactor < 1.0 ? ['AGE_ADJUSTED_DECLINE'] : []),
      ],
    };
  });

  return {
    fitness_tier: fitnessTier,
    estimates,
    rationale_codes: [...BASELINE_ASSESSMENT_CITATIONS],
  };
};

export const suggestedWorkingWeight = (
  estimated1RM: number,
  targetReps: number,
  targetRPE: number,
): number => {
  // Inverse Epley: working weight = 1RM / (1 + reps/30)
  // Then scale down by RPE buffer (RPE 10 = failure, RPE 8 = 2 reps in reserve)
  const repsAtFailure = targetReps + (10 - targetRPE);
  const weight = estimated1RM / (1 + repsAtFailure / 30);
  return Math.round(weight / 2.5) * 2.5;
};
