import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { MovementPattern } from '../domain/exercise/exercise-taxonomy.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import {
  MAX_WEEKLY_VOLUME_INCREASE,
  WEEK_FACTOR_BOUNDS,
  estimateMaximumSessionSets,
} from '../planning/weeks/week-policies.js';
import { MOVEMENT_MUSCLE_MAP } from '../planning/volume/volume-policies.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

// A muscle's delivered sets = sets from patterns where it's the primary
// target, plus indirect_set_credit from patterns where it's secondary
// (e.g. glutes on a squat). Comparing target bounds against what was
// actually allocated, rather than against bounds derived from the target
// itself, is what makes this a real check instead of a tautology.
const deliveredDirectSetsByMuscle = (
  movementPatternBudgets: LongitudinalOdinProgramme['phases'][number]['weeks'][number]['planning_metadata']['movement_pattern_budgets'],
): Record<string, number> => {
  const delivered: Record<string, number> = {};
  movementPatternBudgets.forEach(({ movement_pattern, set_target }) => {
    const primary = MOVEMENT_MUSCLE_MAP[movement_pattern as MovementPattern]?.[0];
    if (primary) {
      delivered[primary] = (delivered[primary] ?? 0) + set_target;
    }
  });
  return delivered;
};

const excludedPatterns = (profile: NormalizedAthleteProfile): Set<string> => {
  const patterns = new Set<string>();
  profile.movement_restrictions
    .filter(({ severity }) => severity === 'avoid')
    .forEach(({ tag }) => {
      if (
        tag === 'loaded_deep_knee_flexion' ||
        tag === 'deep_ankle_dorsiflexion'
      ) {
        patterns.add('squat');
      }
      if (tag === 'unsupported_hip_hinge') patterns.add('hinge');
      if (tag === 'overhead_loading') patterns.add('vertical_push');
      if (tag === 'high_elbow_flexion_load') patterns.add('elbow_flexion');
      if (tag === 'high_elbow_extension_load') patterns.add('elbow_extension');
    });
  return patterns;
};

export const validateLongitudinalWeeks = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const weeks = programme.phases.flatMap((phase) => phase.weeks);
  const excluded = excludedPatterns(profile);
  const maximumSessionSets = estimateMaximumSessionSets(
    profile.source.session_duration_min,
  );
  const status = profile.athlete_state.training_status.value;
  const maximumIncrease = MAX_WEEKLY_VOLUME_INCREASE[status];
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    category:
      | 'structure'
      | 'constraint_fit'
      | 'progression_quality'
      | 'prescription_quality'
      | 'fatigue_management'
      | 'session_time_fit',
    message: string,
    metadata: Record<string, unknown> = {},
  ) =>
    findings.push(
      finding(validationCodes[code], severity, category, message, { metadata }),
    );

  weeks.forEach((week, index) => {
    const previous = weeks[index - 1];
    const factors = [
      [week.planned_volume_factor, WEEK_FACTOR_BOUNDS.volume],
      [week.planned_intensity_factor, WEEK_FACTOR_BOUNDS.intensity],
      [week.planned_effort_factor, WEEK_FACTOR_BOUNDS.effort],
    ] as const;
    if (
      factors.some(
        ([value, bounds]) => value < bounds.min || value > bounds.max,
      )
    ) {
      add(
        'WEEK_FACTOR_OUT_OF_RANGE',
        'error',
        'progression_quality',
        'Week planning factors are outside policy bounds.',
        { week_number: week.week_number },
      );
    }
    if (previous && previous.week_type !== 'deload') {
      const volumeIncrease =
        week.planned_volume_factor / previous.planned_volume_factor - 1;
      if (volumeIncrease > maximumIncrease + 0.005) {
        add(
          'WEEKLY_VOLUME_SPIKE',
          'error',
          'progression_quality',
          'Week-to-week volume increase exceeds policy.',
          { week_number: week.week_number, volume_increase: volumeIncrease },
        );
      }
      const intensityIncrease =
        week.planned_intensity_factor - previous.planned_intensity_factor;
      const effortIncrease =
        week.planned_effort_factor - previous.planned_effort_factor;
      if (intensityIncrease > 0.1) {
        add(
          'WEEKLY_INTENSITY_SPIKE',
          'error',
          'progression_quality',
          'Week-to-week intensity increase is excessive.',
          { week_number: week.week_number },
        );
      }
      if (effortIncrease > 0.1) {
        add(
          'WEEKLY_EFFORT_SPIKE',
          'error',
          'progression_quality',
          'Week-to-week effort increase is excessive.',
          { week_number: week.week_number },
        );
      }
      if (
        volumeIncrease > 0.05 &&
        intensityIncrease > 0.05 &&
        effortIncrease > 0.05
      ) {
        add(
          'COMBINED_LOAD_SPIKE',
          'error',
          'fatigue_management',
          'Volume, intensity and effort increase together excessively.',
          { week_number: week.week_number },
        );
      }
    }
    if (
      profile.source.nutrition?.calorie_status === 'deficit' &&
      week.planned_volume_factor > 1.05
    ) {
      add(
        'DEFICIT_VOLUME_EXCESSIVE',
        'error',
        'fatigue_management',
        'Volume factor is excessive for an explicit calorie deficit.',
        { week_number: week.week_number },
      );
    }
    const deliveredByMuscle = deliveredDirectSetsByMuscle(
      week.planning_metadata.movement_pattern_budgets,
    );
    week.planning_metadata.muscle_group_budgets.forEach((budget) => {
      const delivered =
        (deliveredByMuscle[budget.muscle_group] ?? 0) +
        budget.indirect_set_credit;
      if (delivered > budget.maximum_recoverable_target) {
        add(
          'MUSCLE_VOLUME_EXCESSIVE',
          'error',
          'prescription_quality',
          'Allocated sets exceed the muscle group\'s recoverable target.',
          { week_number: week.week_number, muscle_group: budget.muscle_group },
        );
      }
      if (week.week_type !== 'deload' && delivered < budget.minimum_effective_target) {
        add(
          'MUSCLE_VOLUME_BELOW_REQUIRED',
          'warning',
          'prescription_quality',
          'Allocated sets fall below the muscle group\'s planned minimum.',
          { week_number: week.week_number, muscle_group: budget.muscle_group },
        );
      }
    });
    week.planning_metadata.movement_pattern_budgets.forEach((budget) => {
      if (excluded.has(budget.movement_pattern) && budget.set_target > 0) {
        add(
          'EXCLUDED_MOVEMENT_VOLUME_ASSIGNED',
          'error',
          'constraint_fit',
          'Excluded movement pattern received volume.',
          {
            week_number: week.week_number,
            movement_pattern: budget.movement_pattern,
          },
        );
      }
    });
    week.days.forEach((day) => {
      const budget = day.training_budget;
      if (!budget) return;
      if (budget.total_working_set_budget > maximumSessionSets) {
        add(
          'SESSION_SET_BUDGET_EXCESSIVE',
          'error',
          'session_time_fit',
          'Session set budget exceeds conservative duration capacity.',
          { week_number: week.week_number, cycle_day: day.cycle_day },
        );
      }
      if (budget.estimated_duration_min > profile.source.session_duration_min) {
        add(
          'SESSION_DURATION_BUDGET_INFEASIBLE',
          'error',
          'session_time_fit',
          'Session budget cannot fit the available duration.',
          { week_number: week.week_number, cycle_day: day.cycle_day },
        );
      }
      if (budget.rpe_ceiling < budget.effort_target) {
        add(
          'RPE_CEILING_BELOW_TARGET',
          'error',
          'prescription_quality',
          'Session RPE ceiling is below its target.',
          { week_number: week.week_number, cycle_day: day.cycle_day },
        );
      }
    });
    const intensity = week.planning_metadata.intensity_target;
    if (intensity.maximum_allowed_rpe < intensity.primary_exercise_target_rpe) {
      add(
        'RPE_CEILING_BELOW_TARGET',
        'error',
        'prescription_quality',
        'Weekly RPE ceiling is below primary target RPE.',
        { week_number: week.week_number },
      );
    }
    if (
      (status === 'beginner' ||
        profile.source.nutrition?.calorie_status === 'deficit') &&
      intensity.failure_exposure_policy !== 'none'
    ) {
      add(
        'EXCESSIVE_FAILURE_EXPOSURE',
        'error',
        'fatigue_management',
        'Failure exposure is not appropriate for this athlete state.',
        { week_number: week.week_number },
      );
    }
    if (week.week_type === 'deload') {
      if (
        week.planned_volume_factor > 0.75 ||
        week.planned_effort_factor > 0.9 ||
        !week.planning_metadata.deload_adjustments
      ) {
        add(
          'DELOAD_WEEK_NOT_REDUCED',
          'error',
          'fatigue_management',
          'Deload week does not meaningfully reduce fatigue.',
          { week_number: week.week_number },
        );
      }
      if (
        week.planned_volume_factor < 0.5 ||
        week.planned_intensity_factor < 0.75
      ) {
        add(
          'DELOAD_REDUCTION_EXCESSIVE',
          'warning',
          'fatigue_management',
          'Deload reduction is unusually aggressive.',
          { week_number: week.week_number },
        );
      }
    }
    if (
      week.week_type === 'testing' &&
      programme.strategy.periodization_model !== 'competition_peak'
    ) {
      add(
        'WEEK_TYPE_INVALID',
        'error',
        'structure',
        'Testing week is unsupported by programme strategy.',
        { week_number: week.week_number },
      );
    }
  });

  return findings;
};
