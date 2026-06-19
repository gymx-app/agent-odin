import type { NormalizedAthleteProfile } from '../domain/athlete/athlete.types.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import { CONDITIONING_MODALITIES } from '../planning/conditioning/conditioning-policies.js';
import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

export const validateLongitudinalConditioning = (
  programme: LongitudinalOdinProgramme,
  profile: NormalizedAthleteProfile,
): ProgrammeValidationFinding[] => {
  const findings: ProgrammeValidationFinding[] = [];
  const avoid = new Set(
    profile.movement_restrictions
      .filter((restriction) => restriction.severity === 'avoid')
      .map((restriction) => restriction.tag),
  );
  const modify = new Set(
    profile.movement_restrictions
      .filter((restriction) => restriction.severity === 'modify')
      .map((restriction) => restriction.tag),
  );
  const add = (
    code: keyof typeof validationCodes,
    severity: 'warning' | 'error',
    message: string,
    metadata: Record<string, unknown> = {},
  ) =>
    findings.push(
      finding(
        validationCodes[code],
        severity,
        'prescription_quality',
        message,
        {
          metadata,
        },
      ),
    );

  programme.phases.forEach((phase) =>
    phase.weeks.forEach((week) => {
      const formalDays = week.days.filter((day) =>
        day.conditioning.some(
          (item) =>
            !['sport_conditioning', 'movement_target'].includes(
              item.conditioning_type,
            ),
        ),
      );
      if (formalDays.length !== programme.strategy.conditioning_frequency) {
        add(
          'CONDITIONING_FREQUENCY_MISMATCH',
          'error',
          'Formal conditioning frequency does not match the selected strategy.',
          { week_number: week.week_number },
        );
      }
      const sportItems = week.days.flatMap((day) =>
        day.conditioning.filter(
          (item) => item.conditioning_type === 'sport_conditioning',
        ),
      );
      if (sportItems.length > (profile.source.sport?.sessions_per_week ?? 0)) {
        add(
          'SPORT_CONDITIONING_DUPLICATION',
          'error',
          'Represented sport conditioning exceeds reported sport frequency.',
          { week_number: week.week_number },
        );
      }

      week.days.forEach((day) =>
        day.conditioning.forEach((item) => {
          const metadata = {
            week_number: week.week_number,
            day_id: day.day_id,
            conditioning_id: item.conditioning_id,
          };
          const modality = CONDITIONING_MODALITIES[item.activity_id];
          const excludedTags = modality.restriction_tags.filter((tag) =>
            avoid.has(tag),
          );
          const modifiedTags = modality.restriction_tags.filter((tag) =>
            modify.has(tag),
          );
          if (excludedTags.length > 0) {
            add(
              'CONDITIONING_MODALITY_EXCLUDED',
              'error',
              'Conditioning modality violates an avoid movement restriction.',
              { ...metadata, restriction_tags: excludedTags },
            );
          }
          if (
            modifiedTags.length > 0 &&
            item.modification_metadata === undefined
          ) {
            add(
              'CONDITIONING_MODIFICATION_MISSING',
              'error',
              'Modifiable conditioning lacks explicit modification metadata.',
              { ...metadata, restriction_tags: modifiedTags },
            );
          }
          if (!Number.isFinite(item.duration_min) || item.duration_min <= 0) {
            add(
              'CONDITIONING_DURATION_INVALID',
              'error',
              'Conditioning duration must be exact and positive.',
              metadata,
            );
          }
          if (
            item.intensity.target_min === undefined &&
            item.intensity.target_max === undefined &&
            item.intensity.target_label === undefined
          ) {
            add(
              'CONDITIONING_INTENSITY_UNMEASURABLE',
              'error',
              'Conditioning intensity lacks a measurable target.',
              metadata,
            );
          }
          const intervalBased = ['intervals', 'sprint_intervals'].includes(
            item.conditioning_type,
          );
          if (intervalBased && !item.intervals) {
            add(
              'INTERVAL_STRUCTURE_MISSING',
              'error',
              'Interval conditioning lacks exact work, recovery and count.',
              metadata,
            );
          }
          if (
            item.intervals &&
            (item.intervals.work_seconds <= 0 ||
              item.intervals.recovery_seconds < 0 ||
              item.intervals.interval_count <= 0)
          ) {
            add(
              'INTERVAL_STRUCTURE_INVALID',
              'error',
              'Interval structure contains invalid values.',
              metadata,
            );
          }
          if (!intervalBased && item.intervals) {
            add(
              'STEADY_STATE_HAS_INTERVAL_STRUCTURE',
              'error',
              'Continuous conditioning must not contain interval structure.',
              metadata,
            );
          }
          if (item.rationale.length === 0) {
            add(
              'CONDITIONING_RATIONALE_MISSING',
              'error',
              'Conditioning prescription lacks machine-readable rationale.',
              metadata,
            );
          }
          if (item.interference_risk === 'unacceptable') {
            add(
              'UNACCEPTABLE_CONCURRENT_TRAINING_INTERFERENCE',
              'error',
              'Conditioning has unacceptable concurrent-training interference.',
              metadata,
            );
          } else if (item.interference_risk === 'high') {
            add(
              'HIGH_CONCURRENT_TRAINING_INTERFERENCE',
              'warning',
              'Conditioning has high concurrent-training interference.',
              metadata,
            );
          }
          if (
            item.placement === 'before_resistance' &&
            programme.conditioning_policy.concurrent_training_priority ===
              'resistance' &&
            ['threshold', 'intervals', 'sprint_intervals'].includes(
              item.conditioning_type,
            )
          ) {
            add(
              'CONDITIONING_BEFORE_PRIORITY_RESISTANCE',
              'error',
              'Demanding conditioning precedes priority resistance work.',
              metadata,
            );
          }
          if (
            item.placement === 'same_day_separate_session' &&
            item.same_day_separation === undefined
          ) {
            add(
              'SAME_DAY_SEPARATION_INVALID',
              'error',
              'Separate same-day conditioning lacks separation metadata.',
              metadata,
            );
          }
          if (
            day.day_type === 'combined' &&
            day.estimated_duration_min !== null &&
            day.maximum_duration_min !== null &&
            day.estimated_duration_min > day.maximum_duration_min
          ) {
            add(
              'COMBINED_SESSION_DURATION_EXCEEDED',
              'error',
              'Combined resistance and conditioning exceed session duration.',
              metadata,
            );
          }
        }),
      );

      const load = week.planning_metadata.conditioning_load;
      if (load) {
        if (load.sprint_exposure_count > 2) {
          add(
            'SPRINT_EXPOSURE_EXCESSIVE',
            'error',
            'Weekly sprint exposure exceeds the deterministic limit.',
            { week_number: week.week_number },
          );
        }
        if (load.high_impact_minutes > 90) {
          add(
            'HIGH_IMPACT_LOAD_EXCESSIVE',
            'warning',
            'Weekly high-impact conditioning load is high.',
            { week_number: week.week_number },
          );
        }
        if (load.estimated_fatigue === 'high') {
          add(
            'WEEKLY_CONDITIONING_LOAD_EXCESSIVE',
            'warning',
            'Weekly conditioning fatigue is high.',
            { week_number: week.week_number },
          );
        }
      }
    }),
  );

  const weeks = programme.phases.flatMap((phase) => phase.weeks);
  weeks.slice(1).forEach((week, index) => {
    const previous = weeks[index]!;
    if (['deload', 'maintenance'].includes(previous.week_type)) return;
    week.days.forEach((day) => {
      const current = day.conditioning[0];
      const prior = previous.days.find(
        (candidate) => candidate.cycle_day === day.cycle_day,
      )?.conditioning[0];
      if (!current || !prior) return;
      const durationIncrease = current.duration_min > prior.duration_min * 1.25;
      const currentIntensity =
        current.intensity.target_max ?? current.intensity.target_min ?? 0;
      const priorIntensity =
        prior.intensity.target_max ?? prior.intensity.target_min ?? 0;
      const densityIncrease =
        current.intervals &&
        prior.intervals &&
        (current.intervals.interval_count > prior.intervals.interval_count ||
          current.intervals.recovery_seconds <
            prior.intervals.recovery_seconds);
      if (
        [
          durationIncrease,
          currentIntensity > priorIntensity,
          densityIncrease,
        ].filter(Boolean).length > 1
      ) {
        add(
          'CONDITIONING_PROGRESSION_EXCESSIVE',
          'error',
          'Conditioning progresses more than one primary variable at once.',
          { week_number: week.week_number, cycle_day: day.cycle_day },
        );
      }
    });
  });

  return findings;
};
