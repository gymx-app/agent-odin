import { CONDITIONING_MODALITIES, MODALITY_EXERCISE_MAP } from './conditioning-policies.js';
import { planConditioningIntensity } from './conditioning-intensity-planner.js';
import { selectConditioningModality } from './conditioning-modality-selector.js';
import { planConditioningPlacement } from './conditioning-placement-planner.js';
import {
  conditioningDurationForWeek,
  selectConditioningType,
} from './conditioning-progression-planner.js';
import { planConditioningRequirement } from './conditioning-requirement-planner.js';
import { planResistanceSessionFinisher } from './finisher-planner.js';
import { evaluateInterferenceRisk } from './interference-risk-evaluator.js';
import type {
  ConditioningException,
  ConditioningPlanInput,
  ConditioningPlanResult,
  ConditioningPrescription,
  WeeklyConditioningLoad,
} from './conditioning.types.js';

const priorityFor = (
  input: ConditioningPlanInput,
): ConditioningPlanResult['conditioning_policy']['concurrent_training_priority'] =>
  input.strategy.primary_objective === 'endurance'
    ? 'conditioning'
    : input.profile.source.sport?.priority === 'equal'
      ? 'equal'
      : 'resistance';

const purposeFor = (
  input: ConditioningPlanInput,
): ConditioningPlanResult['conditioning_policy']['primary_purpose'] => {
  const strategy = input.strategy.conditioning_strategy;
  if (strategy === 'health_minimum') return 'health';
  if (strategy === 'none') return 'maintenance';
  return strategy;
};

const prescriptionForDay = (
  input: ConditioningPlanInput,
  day: ConditioningPlanInput['phases'][number]['weeks'][number]['days'][number],
  weekNumber: number,
  weekType: string,
  requirement: ReturnType<typeof planConditioningRequirement>,
  lastResistanceCycleDay?: number,
): ConditioningPrescription | undefined => {
  if (day.day_type === 'sport') {
    const sport = input.profile.source.sport;
    if (!sport) return undefined;
    return {
      conditioning_id: `${day.day_id}-sport`,
      display_order: 1,
      conditioning_type: 'sport_conditioning',
      activity_id: 'sport',
      activity_name: sport.name ?? 'Sport Session',
      purpose: 'Represent reported sport load without duplicating it.',
      duration_min: sport.typical_duration_min ?? 60,
      intensity: {
        method: 'session_rpe',
        target_min:
          sport.intensity === 'high' ? 8 : sport.intensity === 'low' ? 3 : 5,
        target_max:
          sport.intensity === 'high' ? 8 : sport.intensity === 'low' ? 3 : 5,
      },
      impact_level: sport.impact_level ?? 'moderate',
      fatigue_cost: sport.intensity ?? 'moderate',
      placement: 'sport_session',
      interference_risk:
        input.profile.athlete_state.sport_interference_risk.value === 'unknown'
          ? 'moderate'
          : input.profile.athlete_state.sport_interference_risk.value === 'none'
            ? 'low'
            : input.profile.athlete_state.sport_interference_risk.value,
      progression_policy_id: 'conditioning-v2',
      rationale: ['SPORT_CONDITIONING_ACCOUNTED'],
    };
  }
  if (day.day_type === 'resistance') {
    return planResistanceSessionFinisher(
      input.profile,
      input.strategy,
      day,
      weekType,
      {
        weekNumber,
        isLastResistanceDay: day.cycle_day === lastResistanceCycleDay,
      },
    );
  }
  if (!['conditioning', 'combined', 'recovery'].includes(day.day_type)) {
    return undefined;
  }
  const sportHasSprints = input.profile.source.sport?.sprint_exposure === true;
  const type =
    day.day_type === 'recovery'
      ? 'active_recovery'
      : selectConditioningType(
          requirement,
          weekType,
          sportHasSprints,
          input.profile,
          { weekNumber, goal: input.profile.source.goal },
        );
  const modality = selectConditioningModality(input.profile, type);
  const availableCombinedMinutes =
    (day.maximum_duration_min ?? input.profile.source.session_duration_min) -
    (day.estimated_duration_min ?? 0);
  const maximum =
    day.day_type === 'combined'
      ? Math.max(10, availableCombinedMinutes)
      : Math.min(
          day.maximum_duration_min ?? input.profile.source.session_duration_min,
          input.profile.source.session_duration_min,
        );
  const progression = conditioningDurationForWeek(
    type,
    weekNumber,
    weekType,
    maximum,
  );
  const intensity = planConditioningIntensity(type, input.profile);
  const priority = priorityFor(input);
  const placement = planConditioningPlacement({
    profile: input.profile,
    dayType: day.day_type,
    priority,
    weekNumber,
    availableCombinedMinutes,
  });
  const base = {
    conditioning_type: type,
    activity_id: modality.modality,
    duration_min: progression.duration,
    placement: placement.placement,
  } as const;
  const risk = evaluateInterferenceRisk({
    profile: input.profile,
    prescription: base,
    ...(day.exercises.length > 0 ? { resistanceDay: day } : {}),
  });
  return {
    conditioning_id: `${day.day_id}-conditioning`,
    display_order: 1,
    ...base,
    exercise_id: MODALITY_EXERCISE_MAP[modality.modality],
    activity_name: CONDITIONING_MODALITIES[modality.modality].display_name,
    purpose:
      requirement === 'developmental'
        ? 'Develop aerobic capacity while preserving resistance quality.'
        : 'Maintain measurable conditioning with controlled fatigue.',
    intensity: intensity.intensity,
    ...(intensity.intervals ? { intervals: intensity.intervals } : {}),
    ...(placement.same_day_separation
      ? { same_day_separation: placement.same_day_separation }
      : {}),
    impact_level: CONDITIONING_MODALITIES[modality.modality].impact,
    fatigue_cost:
      type === 'active_recovery'
        ? 'low'
        : ['intervals', 'sprint_intervals', 'threshold'].includes(type)
          ? 'high'
          : 'low',
    interference_risk: risk.interference_risk,
    progression_policy_id: 'conditioning-v2',
    rationale: [
      ...modality.rationale_codes,
      ...intensity.rationale_codes,
      progression.rationale_code,
      ...placement.rationale_codes,
      ...risk.rationale_codes,
      ...(sportHasSprints ? ['SPORT_LOAD_REPLACED_HIIT'] : []),
    ],
    ...(modality.status === 'modifiable'
      ? {
          modification_metadata: {
            required: true,
            instructions: ['Use a symptom-free range and conservative setup.'],
            restriction_tags: modality.restriction_tags,
          },
        }
      : {}),
  };
};

const loadForWeek = (
  week: ConditioningPlanResult['phases'][number]['weeks'][number],
  profile: ConditioningPlanInput['profile'],
): WeeklyConditioningLoad => {
  const prescriptions = week.days.flatMap((day) => day.conditioning);
  const formal = prescriptions.filter(
    (item) => item.conditioning_type !== 'sport_conditioning',
  );
  const sport = prescriptions.filter(
    (item) => item.conditioning_type === 'sport_conditioning',
  );
  const minutes = (levels: Array<ConditioningPrescription['fatigue_cost']>) =>
    prescriptions
      .filter((item) => levels.includes(item.fatigue_cost))
      .reduce((sum, item) => sum + Math.round(item.duration_min), 0);
  const highImpact = prescriptions
    .filter((item) => item.impact_level === 'high')
    .reduce((sum, item) => sum + Math.round(item.duration_min), 0);
  const sprintExposure =
    prescriptions.filter(
      (item) => item.conditioning_type === 'sprint_intervals',
    ).length + (profile.source.sport?.sprint_exposure ? sport.length : 0);
  const highMinutes = minutes(['high']);
  return {
    week_number: week.week_number,
    formal_session_count: formal.length,
    sport_session_count: sport.length,
    low_intensity_minutes: minutes(['low']),
    moderate_intensity_minutes: minutes(['moderate']),
    high_intensity_minutes: highMinutes,
    high_impact_minutes: highImpact,
    sprint_exposure_count: sprintExposure,
    estimated_fatigue:
      highMinutes >= 60 || sprintExposure >= 3
        ? 'high'
        : highMinutes > 0 || prescriptions.length >= 3
          ? 'moderate'
          : 'low',
    rationale_codes: [
      ...(sport.length > 0 ? ['SPORT_CONDITIONING_ACCOUNTED'] : []),
      ...(profile.source.sport?.sprint_exposure
        ? ['SPORT_LOAD_LIMITED_CONDITIONING']
        : []),
    ],
  };
};

export const planConditioning = (
  input: ConditioningPlanInput,
): ConditioningPlanResult => {
  const requirement = planConditioningRequirement(input);
  const exceptions: ConditioningException[] = [];
  const phases = input.phases.map((phase) => ({
    ...phase,
    weeks: phase.weeks.map((week) => {
      const lastResistanceCycleDay = Math.max(
        ...week.days
          .filter((d) => d.day_type === 'resistance')
          .map((d) => d.cycle_day),
        -1,
      );
      const days = week.days.map((day) => {
        const prescription = prescriptionForDay(
          input,
          day,
          week.week_number,
          week.week_type,
          requirement,
          lastResistanceCycleDay,
        );
        if (!prescription) return day;
        if (prescription.interference_risk === 'high') {
          exceptions.push({
            code: 'HIGH_CONCURRENT_TRAINING_INTERFERENCE',
            severity: 'warning',
            message: 'A recoverable but high-interference placement remains.',
            affected_day_ids: [day.day_id],
            reason:
              'Calendar availability did not provide a lower-risk placement.',
          });
        }
        const includesResistance =
          day.day_type === 'resistance' ||
          (day.day_type === 'combined' &&
            prescription.placement !== 'same_day_separate_session');
        const combinedDuration = includesResistance
          ? (day.estimated_duration_min ?? 0) + prescription.duration_min
          : day.day_type === 'combined'
            ? (day.estimated_duration_min ?? 0)
            : prescription.duration_min;
        return {
          ...day,
          conditioning: [prescription],
          estimated_duration_min:
            day.day_type === 'sport'
              ? Math.round(prescription.duration_min)
              : Math.round(combinedDuration),
          fatigue_classification:
            prescription.fatigue_cost === 'high'
              ? 'high'
              : day.fatigue_classification,
        };
      });
      const provisional = { ...week, days };
      const load = loadForWeek(provisional, input.profile);
      const { week_number: _weekNumber, ...conditioningLoad } = load;
      return {
        ...provisional,
        planning_metadata: {
          ...week.planning_metadata,
          conditioning_load: conditioningLoad,
        },
      };
    }),
  }));
  const weeklyLoads = phases.flatMap((phase) =>
    phase.weeks.map((week) => loadForWeek(week, input.profile)),
  );
  const rationaleCodes = [
    requirement === 'none'
      ? 'CONDITIONING_NOT_REQUIRED'
      : requirement === 'minimum_health'
        ? 'MINIMUM_HEALTH_CONDITIONING_SELECTED'
        : input.strategy.conditioning_strategy === 'fat_loss_support'
          ? 'FAT_LOSS_SUPPORT_CONDITIONING_SELECTED'
          : 'AEROBIC_BASE_SELECTED',
    ...new Set(
      phases.flatMap((phase) =>
        phase.weeks.flatMap((week) =>
          week.days.flatMap((day) =>
            day.conditioning.flatMap((item) => item.rationale),
          ),
        ),
      ),
    ),
  ];
  return {
    requirement,
    phases,
    conditioning_policy: {
      policy_id: 'conditioning-v2',
      weekly_target_sessions: input.strategy.conditioning_frequency,
      primary_purpose: purposeFor(input),
      preferred_modalities: [
        ...new Set(
          phases.flatMap((phase) =>
            phase.weeks.flatMap((week) =>
              week.days.flatMap((day) =>
                day.conditioning.map((item) => item.activity_id),
              ),
            ),
          ),
        ),
      ],
      restricted_modalities: Object.entries(CONDITIONING_MODALITIES)
        .filter(([, profile]) =>
          profile.restriction_tags.some((tag) =>
            input.profile.movement_restrictions.some(
              (restriction) =>
                restriction.tag === tag && restriction.severity === 'avoid',
            ),
          ),
        )
        .map(([modality]) => modality),
      progression_model:
        requirement === 'performance'
          ? 'interval_count_first'
          : requirement === 'maintenance'
            ? 'maintenance'
            : 'duration_first',
      concurrent_training_priority: priorityFor(input),
      rationale: rationaleCodes,
    },
    weekly_loads: weeklyLoads,
    exceptions,
    rationale_codes: rationaleCodes,
  };
};
