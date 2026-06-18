import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import type { NormalizedAthleteProfile } from '../../src/domain/athlete/athlete.types.js';
import type { Exercise } from '../../src/domain/exercise/exercise.types.js';
import type { OdinProgramme } from '../../src/domain/programme/programme.types.js';
import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import {
  applyValidationSummary,
  validateProgramme,
} from '../../src/validation/programme-validator.js';
import { validationCodes } from '../../src/validation/validation-codes.js';
import type {
  ProgrammeValidationFinding,
  ProgrammeValidationReport,
} from '../../src/validation/validation.types.js';
import { createProfile, workoutDays } from '../planning/test-planning-utils.js';

const profile = (
  patch: Parameters<typeof createProfile>[0] = {},
): NormalizedAthleteProfile =>
  createProfile({
    equipment: 'full_gym',
    available_days_per_week: 3,
    session_duration_min: 60,
    ...patch,
  });

const programmeFor = (
  athlete: NormalizedAthleteProfile = profile(),
): OdinProgramme => buildBaselineProgramme(athlete, seedExercises);

const cloneProgramme = (programme: OdinProgramme): OdinProgramme =>
  structuredClone(programme);

const firstWorkoutExercise = (programme: OdinProgramme) =>
  workoutDays(programme)[0]!.exercises[0]!;

const reportCodes = (report: ProgrammeValidationReport) =>
  new Set(report.findings.map((finding) => finding.code));

const expectFinding = (
  report: ProgrammeValidationReport,
  code: ProgrammeValidationFinding['code'],
) => {
  expect([...reportCodes(report)]).toContain(code);
};

describe('validateProgramme', () => {
  it('returns a deterministic report without mutating the programme', () => {
    const athlete = profile();
    const programme = programmeFor(athlete);
    const before = cloneProgramme(programme);
    const firstReport = validateProgramme(programme, athlete, seedExercises);
    const secondReport = validateProgramme(programme, athlete, seedExercises);

    expect(firstReport).toStrictEqual(secondReport);
    expect(programme).toStrictEqual(before);
    expect(
      firstReport.findings.filter((finding) => finding.severity === 'error'),
    ).toEqual([]);
    expect(firstReport.passed).toBe(true);
    expect(firstReport.status).not.toBe('fail');
    expect(firstReport.overall_score).toBeGreaterThanOrEqual(0);
    expect(firstReport.overall_score).toBeLessThanOrEqual(100);
  });

  it('can apply validation summary without mutating the source programme', () => {
    const athlete = profile();
    const programme = programmeFor(athlete);
    const before = cloneProgramme(programme);
    const report = validateProgramme(programme, athlete, seedExercises);
    const withSummary = applyValidationSummary(programme, report);

    expect(programme).toStrictEqual(before);
    expect(withSummary).not.toBe(programme);
    expect(withSummary.validation_summary.passed).toBe(report.passed);
    expect(withSummary.validation_summary.scores.constraint_fit).toBe(
      report.scores.constraint_fit,
    );
  });

  it('reports structural errors with stable machine-readable codes', () => {
    const athlete = profile();
    const programme = cloneProgramme(programmeFor(athlete));
    const firstTemplate = programme.phase_week_templates[0]!;

    programme.config.total_phases = 2;
    firstTemplate.days = firstTemplate.days.slice(0, 6);
    firstTemplate.days[0]!.exercises[0]!.display_order =
      firstTemplate.days[1]!.exercises[0]?.display_order ?? 0;

    const report = validateProgramme(programme, athlete, seedExercises);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.PHASE_COUNT_MISMATCH);
    expectFinding(report, validationCodes.MISSING_WEEKDAY);
    expectFinding(report, validationCodes.PROGRAMME_SCHEMA_INVALID);
  });

  it('rejects unknown, deprecated, duplicated, and mismatched exercise references', () => {
    const athlete = profile();
    const programme = cloneProgramme(programmeFor(athlete));
    const firstExercise = firstWorkoutExercise(programme);
    const duplicate = structuredClone(firstExercise);
    const deprecatedLibrary: Exercise[] = seedExercises.map((exercise) =>
      exercise.id === firstExercise.exercise_id
        ? { ...exercise, status: 'deprecated' }
        : exercise,
    );

    firstExercise.exercise_id = 'unknown_exercise';
    firstExercise.exercise_name = 'Not Library Name';
    workoutDays(programme)[0]!.exercises.push(duplicate);
    workoutDays(programme)[0]!.exercises.push({
      ...structuredClone(duplicate),
      display_order: duplicate.display_order + 1,
    });

    const report = validateProgramme(programme, athlete, deprecatedLibrary);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.UNKNOWN_EXERCISE_ID);
    expectFinding(report, validationCodes.DEPRECATED_EXERCISE_USED);
    expectFinding(report, validationCodes.DUPLICATE_EXERCISE_IN_WORKOUT);
  });

  it('flags unavailable equipment and athlete movement restrictions', () => {
    const fullGymProfile = profile();
    const programme = programmeFor(fullGymProfile);
    const bodyweightProfile = {
      ...profile({ equipment: 'bodyweight' }),
      excluded_exercise_ids: [firstWorkoutExercise(programme).exercise_id],
      movement_restrictions: [
        {
          tag: 'loaded_deep_knee_flexion',
          severity: 'avoid',
          source_area: 'knee',
          notes: 'Avoid loaded deep knee flexion.',
        },
      ],
    } satisfies NormalizedAthleteProfile;

    const report = validateProgramme(
      programme,
      bodyweightProfile,
      seedExercises,
    );

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.EQUIPMENT_UNAVAILABLE);
    expectFinding(report, validationCodes.EXCLUDED_EXERCISE_USED);
    expectFinding(report, validationCodes.AVOID_RESTRICTION_VIOLATION);
  });

  it('flags invalid prescription and weak progression details', () => {
    const athlete = profile();
    const programme = cloneProgramme(programmeFor(athlete));
    const exercise = firstWorkoutExercise(programme);

    exercise.coaching_cues.push('Use exactly 40 kg today.');
    exercise.progression_bounds.rep_max =
      exercise.progression_bounds.rep_min - 1;
    exercise.progression_rule = 'Repeat the same work.';
    exercise.sets[0]!.target_reps = 0;
    exercise.sets[0]!.target_rpe = 11;
    exercise.sets[0]!.rest_seconds = -1;

    const report = validateProgramme(programme, athlete, seedExercises);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.SPECIFIC_WEIGHT_PRESCRIBED);
    expectFinding(report, validationCodes.INVALID_PROGRESSION_BOUNDS);
    expectFinding(report, validationCodes.INVALID_SET_TARGET);
    expectFinding(report, validationCodes.INVALID_RPE_TARGET);
    expectFinding(report, validationCodes.INVALID_REST_TARGET);
    expectFinding(report, validationCodes.WEAK_PROGRESSION_RULE);
    expect(report.scores.prescription_quality).toBe(0);
  });

  it('flags session-duration violations and rest-day duration leakage', () => {
    const athlete = profile({ session_duration_min: 20 });
    const programme = cloneProgramme(programmeFor(profile()));
    const restDay = programme.phase_week_templates[0]!.days.find(
      (day) => day.workout_type === 'rest',
    )!;

    restDay.duration_min = 10;

    const report = validateProgramme(programme, athlete, seedExercises);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.WORKOUT_DURATION_EXCEEDED);
    expectFinding(report, validationCodes.REST_DURATION_PRESENT);
  });

  it('flags movement imbalance, recovery overlap, and excess fatigue', () => {
    const athlete = {
      ...profile(),
      recovery_capacity: 'low',
    } satisfies NormalizedAthleteProfile;
    const programme = cloneProgramme(programmeFor(profile()));
    const monday = programme.phase_week_templates[0]!.days[0]!;
    const tuesday = programme.phase_week_templates[0]!.days[1]!;
    const deadlift = seedExercises.find(
      (exercise) => exercise.id === 'barbell_deadlift',
    )!;

    monday.workout_type = 'workout';
    monday.exercises = [
      {
        ...structuredClone(firstWorkoutExercise(programme)),
        exercise_id: deadlift.id,
        exercise_name: deadlift.name,
        movement_patterns: deadlift.movement_patterns,
        primary_muscles: deadlift.primary_muscles,
        secondary_muscles: deadlift.secondary_muscles,
        equipment: deadlift.equipment,
      },
    ];
    tuesday.workout_type = 'workout';
    tuesday.exercises = structuredClone(monday.exercises);
    programme.phase_week_templates[0]!.days.forEach((day) => {
      day.exercises.forEach((exercise) => {
        exercise.movement_patterns = ['horizontal_push'];
        exercise.sets = Array.from({ length: 8 }, (_, index) => ({
          ...exercise.sets[0]!,
          set_number: index + 1,
          target_rpe: 9,
          rpe_ceiling: 9,
        }));
      });
    });

    const report = validateProgramme(programme, athlete, seedExercises);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.PUSH_PULL_IMBALANCE);
    expectFinding(report, validationCodes.CONSECUTIVE_AXIAL_FATIGUE);
    expectFinding(report, validationCodes.CONSECUTIVE_MUSCLE_OVERLAP);
    expectFinding(report, validationCodes.LOW_RECOVERY_HIGH_FATIGUE);
  });

  it('flags goal and naming mismatches', () => {
    const athlete = profile({ goal: 'fat_loss' });
    const programme = cloneProgramme(programmeFor(athlete));

    programme.programme.name =
      'Ultimate Odin Ragnarok Extreme Fat Loss Programme For Rohan';
    programme.phases[0]!.name = 'Hypertrophy';
    programme.assumptions.push('Burns 500 calories per workout.');
    programme.phase_week_templates[0]!.days.forEach((day) => {
      if (day.workout_type === 'liss') {
        day.workout_type = 'rest';
        day.liss_content = null;
        day.duration_min = null;
      }
    });

    const report = validateProgramme(programme, athlete, seedExercises);

    expect(report.status).toBe('fail');
    expectFinding(report, validationCodes.GOAL_STRUCTURE_MISMATCH);
    expectFinding(report, validationCodes.NON_FOUNDATION_PHASE_NAME);
    expectFinding(report, validationCodes.VERBOSE_PROGRAMME_NAME);
  });
});
