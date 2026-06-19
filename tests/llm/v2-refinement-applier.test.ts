import { describe, expect, it } from 'vitest';
import { applyV2ProgrammeRefinement } from '../../src/llm/v2-refinement-applier.js';
import { validLongitudinalProgramme } from '../../fixtures/programmes/valid-longitudinal-programme.js';
import type { LongitudinalOdinProgramme } from '../../src/domain/programme/programme.types.js';
import type { OdinProgramme } from '../../src/domain/programme/programme.types.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile } from '../planning/test-planning-utils.js';
import type { V2RefinementProposal } from '../../src/llm/v2-refinement.types.js';

const profile = createProfile({
  equipment: 'full_gym',
  available_days_per_week: 3,
  session_duration_min: 60,
});

const makeProgramme = (): LongitudinalOdinProgramme =>
  structuredClone(validLongitudinalProgramme);

type V2Operation = V2RefinementProposal['operations'][number];

const v2Proposal = (operations: V2Operation[]): V2RefinementProposal => ({
  decision: operations.length > 0 ? 'refine' : 'no_change',
  summary: operations.length > 0 ? 'Apply bounded changes.' : 'No change.',
  confidence: 'high',
  operations,
});

const firstExercise = (programme: LongitudinalOdinProgramme) => {
  const day = programme.phases[0]!.weeks[0]!.days.find(
    (day) => day.exercises.length > 0,
  )!;
  return { day, exercise: day.exercises[0]! };
};

const firstConditioning = (programme: LongitudinalOdinProgramme) => {
  const day = programme.phases[0]!.weeks[0]!.days.find(
    (day) => day.conditioning.length > 0,
  )!;
  return { day, conditioning: day.conditioning[0]! };
};

describe('applyV2ProgrammeRefinement', () => {
  it('applies a valid exercise replacement', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);
    const approvedIds =
      exercise.substitution_options?.approved_exercise_ids ?? [];
    if (approvedIds.length === 0) return;
    const replacementId = approvedIds[0]!;
    const replacement = seedExercises.find((ex) => ex.id === replacementId);
    if (!replacement) return;

    const refined = applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-replace',
          operation_type: 'replace_exercise',
          target_id: exercise.prescription_id,
          replacement_id: replacementId,
          reason_code: 'EXERCISE_VARIETY',
          reason: 'Improve variety.',
        },
      ]),
      seedExercises,
      profile,
    );

    const replaced = refined.phases[0]!.weeks[0]!.days.flatMap(
      (d) => d.exercises,
    ).find((e) => e.prescription_id === exercise.prescription_id);
    expect(replaced?.exercise_id).toBe(replacementId);
  });

  it('rejects replacement with unknown exercise ID', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-unknown',
            operation_type: 'replace_exercise',
            target_id: exercise.prescription_id,
            replacement_id: 'invented_exercise_xyz',
            reason_code: 'EXERCISE_VARIETY',
            reason: 'Try something new.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('not in approved library');
  });

  it('rejects replacement outside approved candidates', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);
    const notApproved = seedExercises.find(
      (ex) =>
        ex.id !== exercise.exercise_id &&
        !(exercise.substitution_options?.approved_exercise_ids ?? []).includes(
          ex.id,
        ),
    );
    if (!notApproved) return;

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-not-approved',
            operation_type: 'replace_exercise',
            target_id: exercise.prescription_id,
            replacement_id: notApproved.id,
            reason_code: 'EXERCISE_VARIETY',
            reason: 'Try an unapproved candidate.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('not in approved candidates');
  });

  it('rejects replacement with excluded exercise', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);
    const approvedIds =
      exercise.substitution_options?.approved_exercise_ids ?? [];
    if (approvedIds.length === 0) return;
    const restrictedProfile = createProfile({
      equipment: 'full_gym',
      available_days_per_week: 3,
      session_duration_min: 60,
    });
    const replacement = seedExercises.find(
      (ex) =>
        approvedIds.includes(ex.id) &&
        ex.movement_demands.loaded_deep_knee_flexion > 0,
    );
    if (!replacement) return;
    restrictedProfile.movement_restrictions = [
      {
        tag: 'loaded_deep_knee_flexion',
        severity: 'avoid',
        notes: 'test restriction',
        source_area: 'knee',
      },
    ];

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-excluded',
            operation_type: 'replace_exercise',
            target_id: exercise.prescription_id,
            replacement_id: replacement.id,
            reason_code: 'EXERCISE_VARIETY',
            reason: 'Restricted exercise.',
          },
        ]),
        seedExercises,
        restrictedProfile,
      ),
    ).toThrow();
  });

  it('rejects replacement requiring unavailable equipment', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);
    const approvedIds =
      exercise.substitution_options?.approved_exercise_ids ?? [];
    const bodyweightProfile = createProfile({
      equipment: 'bodyweight',
      available_days_per_week: 3,
      session_duration_min: 60,
    });
    const needsEquipment = seedExercises.find(
      (ex) =>
        approvedIds.includes(ex.id) &&
        ex.equipment.some((e) => e !== 'bodyweight'),
    );
    if (!needsEquipment) return;

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-no-equip',
            operation_type: 'replace_exercise',
            target_id: exercise.prescription_id,
            replacement_id: needsEquipment.id,
            reason_code: 'EQUIPMENT_FIT',
            reason: 'Try equipment exercise.',
          },
        ]),
        seedExercises,
        bodyweightProfile,
      ),
    ).toThrow('unavailable equipment');
  });

  it('rejects replacement that creates a duplicate exercise', () => {
    const programme = makeProgramme();
    const day = programme.phases[0]!.weeks[0]!.days.find(
      (d) => d.exercises.length >= 2,
    );
    if (!day) return;
    const first = day.exercises[0]!;
    const second = day.exercises[1]!;
    const programme2 = structuredClone(programme);
    const day2 = programme2.phases[0]!.weeks[0]!.days.find(
      (d) => d.exercises.length >= 2,
    )!;
    day2.exercises[0]!.substitution_options = {
      approved_exercise_ids: [second.exercise_id],
      preserve: 'movement_pattern',
    };

    expect(() =>
      applyV2ProgrammeRefinement(
        programme2,
        v2Proposal([
          {
            operation_id: 'op-dup',
            operation_type: 'replace_exercise',
            target_id: first.prescription_id,
            replacement_id: second.exercise_id,
            reason_code: 'EXERCISE_VARIETY',
            reason: 'Would create duplicate.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('duplicate');
  });

  it('applies a valid optional set reduction', () => {
    const programme = makeProgramme();
    const day = programme.phases[0]!.weeks[0]!.days.find(
      (d) => d.exercises.length > 0,
    )!;
    const optional = day.exercises.find((e) =>
      ['accessory', 'isolation', 'core'].includes(e.sequence_role),
    );
    if (!optional || optional.sets.length <= 1) return;

    const refined = applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-reduce-sets',
          operation_type: 'reduce_optional_sets',
          target_id: optional.prescription_id,
          new_value: 1,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Reduce time.',
        },
      ]),
      seedExercises,
      profile,
    );

    const updated = refined.phases[0]!.weeks[0]!.days.flatMap(
      (d) => d.exercises,
    ).find((e) => e.prescription_id === optional.prescription_id);
    expect(updated?.sets.length).toBe(1);
  });

  it('rejects primary set reduction', () => {
    const programme = makeProgramme();
    const { exercise } = firstExercise(programme);
    if (exercise.sequence_role !== 'primary') return;

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-reduce-primary',
            operation_type: 'reduce_optional_sets',
            target_id: exercise.prescription_id,
            new_value: 1,
            reason_code: 'SESSION_TIME_FIT',
            reason: 'Reduce primary sets.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('Only optional exercises');
  });

  it('applies a valid exercise reorder', () => {
    const programme = makeProgramme();
    const day = programme.phases[0]!.weeks[0]!.days.find(
      (d) => d.exercises.length > 1,
    );
    if (!day) return;
    const exercise = day.exercises[0]!;

    const refined = applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-reorder',
          operation_type: 'reorder_exercise',
          target_id: exercise.prescription_id,
          new_value: 1,
          reason_code: 'FATIGUE_REDUCTION',
          reason: 'Better sequencing.',
        },
      ]),
      seedExercises,
      profile,
    );

    expect(refined).toBeDefined();
  });

  it('applies a valid conditioning duration reduction', () => {
    const programme = makeProgramme();
    const { conditioning } = firstConditioning(programme);

    const refined = applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-cond-duration',
          operation_type: 'reduce_conditioning_duration',
          target_id: conditioning.conditioning_id,
          new_value: conditioning.duration_min - 5,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Reduce conditioning time.',
        },
      ]),
      seedExercises,
      profile,
    );

    const updated = refined.phases[0]!.weeks[0]!.days.flatMap(
      (d) => d.conditioning,
    ).find((c) => c.conditioning_id === conditioning.conditioning_id);
    expect(updated?.duration_min).toBe(conditioning.duration_min - 5);
  });

  it('applies a valid warmup replacement', () => {
    const programme = makeProgramme();
    const day = programme.phases[0]!.weeks[0]!.days.find(
      (d) => d.warmup.length > 0,
    )!;
    const replaceable = day.warmup.find(
      (w) =>
        w.component_type !== 'pulse_raiser' &&
        w.component_type !== 'ramp_up_set',
    );
    if (!replaceable) return;

    const refined = applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-warmup',
          operation_type: 'replace_optional_warmup_component',
          target_id: replaceable.warmup_id,
          replacement_id: 'hip_circles',
          new_value: 'Hip Circles',
          reason_code: 'WARMUP_IMPROVEMENT',
          reason: 'Better preparation.',
        },
      ]),
      seedExercises,
      profile,
    );

    const updated = refined.phases[0]!.weeks[0]!.days.flatMap(
      (d) => d.warmup,
    ).find((w) => w.warmup_id === replaceable.warmup_id);
    expect(updated?.activity_name).toBe('Hip Circles');
  });

  it('rejects unsupported operation type via schema', () => {
    const programme = makeProgramme();
    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        {
          decision: 'refine',
          summary: 'Bad operation.',
          confidence: 'high',
          operations: [
            {
              operation_id: 'op-bad',
              operation_type: 'add_secret_exercise' as never,
              target_id: 'some-id',
              reason_code: 'GOAL_SPECIFICITY',
              reason: 'Should fail.',
            } as never,
          ],
        },
        seedExercises,
        profile,
      ),
    ).toThrow();
  });

  it('rejects V1 programme input', () => {
    const programme = makeProgramme();
    const v1Programme = {
      ...programme,
      schema_version: '1.0',
    } as unknown as LongitudinalOdinProgramme;

    expect(() =>
      applyV2ProgrammeRefinement(
        v1Programme,
        v2Proposal([]),
        seedExercises,
        profile,
      ),
    ).toThrow('schema version 2.0');
  });

  it('does not mutate the baseline', () => {
    const programme = makeProgramme();
    const baseline = structuredClone(programme);
    const { conditioning } = firstConditioning(programme);

    applyV2ProgrammeRefinement(
      programme,
      v2Proposal([
        {
          operation_id: 'op-no-mutate',
          operation_type: 'reduce_conditioning_duration',
          target_id: conditioning.conditioning_id,
          new_value: conditioning.duration_min - 5,
          reason_code: 'SESSION_TIME_FIT',
          reason: 'Reduce.',
        },
      ]),
      seedExercises,
      profile,
    );

    expect(programme).toStrictEqual(baseline);
  });

  it('rejects conditioning move that worsens interference', () => {
    const programme = makeProgramme();
    const { conditioning } = firstConditioning(programme);
    const day = programme.phases[0]!.weeks[0]!.days.find((d) =>
      d.conditioning.some(
        (c) => c.conditioning_id === conditioning.conditioning_id,
      ),
    )!;
    day.day_type = 'combined';
    (conditioning as Record<string, unknown>).interference_risk = 'low';

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-move-bad',
            operation_type: 'move_conditioning',
            target_id: conditioning.conditioning_id,
            new_value: 'before_resistance',
            reason_code: 'CONDITIONING_PLACEMENT',
            reason: 'Move before resistance.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('worsens interference');
  });

  it('rejects pulse raiser warmup replacement', () => {
    const programme = makeProgramme();
    const day = programme.phases[0]!.weeks[0]!.days.find((d) =>
      d.warmup.some((w) => w.component_type === 'pulse_raiser'),
    )!;
    const pulseRaiser = day.warmup.find(
      (w) => w.component_type === 'pulse_raiser',
    )!;

    expect(() =>
      applyV2ProgrammeRefinement(
        programme,
        v2Proposal([
          {
            operation_id: 'op-warmup-bad',
            operation_type: 'replace_optional_warmup_component',
            target_id: pulseRaiser.warmup_id,
            replacement_id: 'jumping_jacks',
            reason_code: 'WARMUP_IMPROVEMENT',
            reason: 'Replace pulse raiser.',
          },
        ]),
        seedExercises,
        profile,
      ),
    ).toThrow('Pulse raisers and ramp-up sets cannot be replaced');
  });
});
