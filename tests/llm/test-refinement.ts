import { buildBaselineProgramme } from '../../src/planning/baseline-programme-planner.js';
import { validateProgramme } from '../../src/validation/programme-validator.js';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { createProfile } from '../planning/test-planning-utils.js';
import type { ProgrammeRefinementProposal } from '../../src/llm/refinement.types.js';

export const refinementFixture = () => {
  const profile = createProfile({
    equipment: 'full_gym',
    available_days_per_week: 3,
    session_duration_min: 60,
  });
  const programme = buildBaselineProgramme(profile, seedExercises);
  const validation = validateProgramme(programme, profile, seedExercises);

  return { profile, programme, validation, exercises: seedExercises };
};

export const operation = (
  patch: Partial<ProgrammeRefinementProposal['operations'][number]>,
): ProgrammeRefinementProposal['operations'][number] => ({
  operation_id: 'operation_1',
  type: 'no_change',
  phase_number: 1,
  day_of_week: null,
  exercise_id: null,
  replacement_exercise_id: null,
  set_number: null,
  new_target_reps: null,
  new_target_rpe: null,
  new_rpe_ceiling: null,
  new_rest_seconds: null,
  new_set_count: null,
  new_liss_duration_min: null,
  new_display_order: null,
  new_subtitle: null,
  coaching_cue: null,
  review_trigger: null,
  reason_code: 'NO_CHANGE_REQUIRED',
  reason: 'No change is required.',
  ...patch,
});

export const proposal = (
  operations: ProgrammeRefinementProposal['operations'],
): ProgrammeRefinementProposal => ({
  decision: operations.length > 0 ? 'refine' : 'no_change',
  summary:
    operations.length > 0 ? 'Apply bounded changes.' : 'No change needed.',
  confidence: 'high',
  operations,
  assumptions: [],
  review_triggers: [],
});
