import { describe, expect, it } from 'vitest';
import { applyProgrammeRefinement } from '../../src/llm/refinement-applier.js';
import { findExerciseSubstitutions } from '../../src/exercises/substitutions.js';
import { operation, proposal, refinementFixture } from './test-refinement.js';

const firstWorkoutExercise = (fixture: ReturnType<typeof refinementFixture>) =>
  fixture.programme.phase_week_templates[0]!.days.find(
    (day) => day.workout_type === 'workout',
  )!.exercises[0]!;

describe('applyProgrammeRefinement', () => {
  it('applies a bounded rep change without mutating the baseline', () => {
    const fixture = refinementFixture();
    const baseline = structuredClone(fixture.programme);
    const exercise = firstWorkoutExercise(fixture);
    const set = exercise.sets[0]!;
    const target =
      set.target_reps < exercise.progression_bounds.rep_max
        ? set.target_reps + 1
        : set.target_reps - 1;
    const refined = applyProgrammeRefinement(
      fixture.programme,
      proposal([
        operation({
          type: 'adjust_target_reps',
          day_of_week: fixture.programme.phase_week_templates[0]!.days.find(
            (day) => day.exercises.includes(exercise),
          )!.day_of_week,
          exercise_id: exercise.exercise_id,
          set_number: set.set_number,
          new_target_reps: target,
          reason_code: 'GOAL_SPECIFICITY',
        }),
      ]),
      fixture.exercises,
      fixture.profile,
    );

    expect(fixture.programme).toStrictEqual(baseline);
    expect(
      refined.phase_week_templates[0]!.days.flatMap(
        (day) => day.exercises,
      ).find((candidate) => candidate.exercise_id === exercise.exercise_id)!
        .sets[0]!.target_reps,
    ).toBe(target);
  });

  it('rejects unknown replacements and excessive set changes', () => {
    const fixture = refinementFixture();
    const day = fixture.programme.phase_week_templates[0]!.days.find(
      (candidate) => candidate.workout_type === 'workout',
    )!;
    const exercise = day.exercises[0]!;

    expect(() =>
      applyProgrammeRefinement(
        fixture.programme,
        proposal([
          operation({
            type: 'replace_exercise',
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            replacement_exercise_id: 'invented_exercise',
          }),
        ]),
        fixture.exercises,
        fixture.profile,
      ),
    ).toThrow('Replacement exercise is not in the approved library.');

    expect(() =>
      applyProgrammeRefinement(
        fixture.programme,
        proposal([
          operation({
            type: 'adjust_set_count',
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            new_set_count: exercise.sets.length + 2,
          }),
        ]),
        fixture.exercises,
        fixture.profile,
      ),
    ).toThrow('Set count may change by at most one');
  });

  it('rejects approved replacements outside the deterministic shortlist', () => {
    const fixture = refinementFixture();
    const day = fixture.programme.phase_week_templates[0]!.days.find(
      (candidate) => candidate.workout_type === 'workout',
    )!;
    const exercise = day.exercises[0]!;
    const approved = fixture.exercises.find(
      (item) => item.id === exercise.exercise_id,
    )!;
    const syntheticAlternatives = Array.from({ length: 6 }, (_, index) => ({
      ...approved,
      id: `synthetic_alternative_${index + 1}`,
      name: `Synthetic Alternative ${String(index + 1).padStart(2, '0')}`,
      aliases: [],
    }));
    const exercises = [...fixture.exercises, ...syntheticAlternatives];
    const outsideShortlist = findExerciseSubstitutions(
      approved,
      exercises,
      fixture.profile,
    ).find(
      (candidate) => candidate.exercise.id === 'synthetic_alternative_6',
    )!.exercise;

    expect(
      findExerciseSubstitutions(approved, exercises, fixture.profile)
        .slice(0, 5)
        .map((candidate) => candidate.exercise.id),
    ).not.toContain(outsideShortlist.id);

    expect(() =>
      applyProgrammeRefinement(
        fixture.programme,
        proposal([
          operation({
            type: 'replace_exercise',
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            replacement_exercise_id: outsideShortlist.id,
          }),
        ]),
        exercises,
        fixture.profile,
      ),
    ).toThrow('Replacement exercise is not eligible for this programme slot.');
  });

  it('rejects specific weights in coaching cues', () => {
    const fixture = refinementFixture();
    const day = fixture.programme.phase_week_templates[0]!.days.find(
      (candidate) => candidate.workout_type === 'workout',
    )!;
    const exercise = day.exercises[0]!;

    expect(() =>
      applyProgrammeRefinement(
        fixture.programme,
        proposal([
          operation({
            type: 'add_coaching_cue',
            day_of_week: day.day_of_week,
            exercise_id: exercise.exercise_id,
            coaching_cue: 'Use 40 kg.',
          }),
        ]),
        fixture.exercises,
        fixture.profile,
      ),
    ).toThrow('prescribes a specific weight');
  });
});
