import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../fixtures/exercises/seed-exercises.js';
import { validAthleteFixtures } from '../../fixtures/athletes/valid-athletes.js';
import { goldenSetAthleteFixtures } from '../../fixtures/athletes/golden-set.js';
import { normalizeAthlete } from '../../src/normalization/athlete-normalizer.js';
import { buildLongitudinalProgramme } from '../../src/planning/longitudinal-programme-planner.js';
import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';

/**
 * Deterministic regression suite for the rule-based scoring pipeline.
 * Zero LLM calls — exercises only buildLongitudinalProgramme +
 * programmeValidationService's existing scoring. CI-safe.
 *
 * Catches: a validator change, a score-calculator.ts weight/penalty change,
 * or a planner change that regresses a previously-clean profile.
 * Does NOT catch: a live-LLM prompt/model regression — no LLM runs here.
 * That needs a separate, manually-triggered live-eval pass (not built yet).
 *
 * Floors below are measured, not guessed: every included profile scores a
 * clean 100/100 across all 11 categories today. Any drop is a real signal.
 */
const CATEGORIES = [
  'structure',
  'constraint_fit',
  'exercise_integrity',
  'movement_balance',
  'recovery_fit',
  'fatigue_management',
  'goal_specificity',
  'progression_quality',
  'session_time_fit',
  'prescription_quality',
  'naming_quality',
] as const;

const OVERALL_SCORE_FLOOR = 100;
const CATEGORY_SCORE_FLOOR = 100;

// Enriched Recomposition is excluded not because it's broken (it was, and
// two real bugs behind that — a self-contradictory schedule/sport fixture
// and a schema rule missing 'sport' from its conditioning-bearing day types
// — are now fixed, see valid-athletes.ts and longitudinal-programme.schema.ts)
// but because its legitimate baseline is 99/100 overall with a deserved
// recovery_fit warning (a sport day lands right after a resistance day),
// not the uniform 100 floor this suite otherwise asserts. Worth its own
// per-profile floor if this corpus grows enough to justify one.
// (Intermediate Hypertrophy was also excluded for a duplicated name/display_name
// comparison bug in programme-validation.service.ts and session-validator.ts —
// now fixed, and included in the corpus above.)
const EXCLUDED_PROFILE_NAMES = new Set(['Enriched Recomposition']);
const PROFILES: AthleteInput[] = [
  ...validAthleteFixtures.filter((a) => !EXCLUDED_PROFILE_NAMES.has(a.name)),
  ...goldenSetAthleteFixtures,
];

describe('golden-set deterministic scoring', () => {
  it.each(PROFILES.map((athlete) => [athlete.name, athlete] as const))(
    '%s scores at or above the deterministic baseline floor',
    (_name, athleteInput) => {
      const profile = normalizeAthlete(athleteInput);
      const { validation } = buildLongitudinalProgramme(
        profile,
        seedExercises,
        {
          startDate: '2026-06-22',
          generatedAt: '2026-06-22T00:00:00.000Z',
          exerciseLibraryVersion: 'golden-set-eval-v1',
        },
      );

      expect(validation.overall_score).toBeGreaterThanOrEqual(
        OVERALL_SCORE_FLOOR,
      );
      for (const category of CATEGORIES) {
        expect(validation.scores[category]).toBeGreaterThanOrEqual(
          CATEGORY_SCORE_FLOOR,
        );
      }
    },
  );
});
