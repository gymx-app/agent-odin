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
    '26fc1e3925d8233742417c5a28aed3b681451308a5192899dddc4ee7147c2a1c',
  ],
  [
    intermediateHypertrophyKneeAthlete.name,
    '616b9b6856ca9bf5e719d4e2a150f81c10a96dfcc1b0893caeadff9f24da8381',
  ],
  [
    advancedStrengthInBodyAthlete.name,
    'f3765fdc34e75e7b15111a6c3eb149295125b00c7d0906f2902cd002c325da3b',
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
