import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  advancedStrengthInBodyAthlete,
  beginnerFatLossAthlete,
  intermediateHypertrophyKneeAthlete,
} from '../../fixtures/athletes/valid-athletes.js';
import { previewProgramme } from '../../src/application/programme-preview.service.js';
import { seedExercises } from '../../src/exercises/approved-exercise-library.js';
import { canonicalizeJson } from '../../src/shared/canonical-json.js';

const deterministicPreviewHashes = new Map([
  [
    beginnerFatLossAthlete.name,
    '84fd980f36fc14ddf78c409d169f1709b288306e5cc2a6fbacf16293eb0d7f8e',
  ],
  [
    intermediateHypertrophyKneeAthlete.name,
    '9a8a732e0465704a39b769192466da0e97fd1d3aee25b769d5e424f4e46fb604',
  ],
  [
    advancedStrengthInBodyAthlete.name,
    '0f02e5d1d422abb7d29505bfafa5265dd11f61d0224fb325ec4237d5b00c4f72',
  ],
]);

describe('deterministic programme preview regression', () => {
  it.each([
    beginnerFatLossAthlete,
    intermediateHypertrophyKneeAthlete,
    advancedStrengthInBodyAthlete,
  ])('preserves the complete preview for $name', async (athlete) => {
    const result = await previewProgramme(athlete, 'deterministic', {
      requestId: 'preview-regression',
      exercises: seedExercises,
    });
    const legacyResult = {
      source: result.source,
      programme: result.programme,
      validation: result.validation,
      refinement: result.refinement,
    };
    const hash = createHash('sha256')
      .update(canonicalizeJson(legacyResult))
      .digest('hex');

    expect(hash).toBe(deterministicPreviewHashes.get(athlete.name));
  });
});
