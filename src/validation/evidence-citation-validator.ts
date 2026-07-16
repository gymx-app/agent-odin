import { validationCodes } from './validation-codes.js';
import { finding } from './validation-helpers.js';
import { ALL_CITATION_CODES } from '../planning/evidence.js';
import type { LongitudinalOdinProgramme } from '../domain/programme/programme.types.js';
import type { ProgrammeValidationFinding } from './validation.types.js';

// rationale_codes fields carry both real evidence citations (e.g.
// SCHOENFELD_2017_DOSE_RESPONSE) and internal decision tags (e.g.
// RECENT_VOLUME_ANCHORED) in the same string[]. Only strings shaped like a
// citation (AUTHOR_YEAR_TOPIC) are checked against the registry — internal
// tags never match this shape, so this doesn't false-positive on them.
export const CITATION_SHAPE = /^[A-Z][A-Z0-9]*_(?:19|20)\d{2}_[A-Z0-9_]+$/;

export const collectRationaleCodes = (value: unknown, out: Set<string>): void => {
  if (Array.isArray(value)) {
    value.forEach((v) => collectRationaleCodes(v, out));
    return;
  }
  if (value && typeof value === 'object') {
    // strategy.rationale is StrategyDecisionSchema[] — {code, reason,
    // selected_value, source_fields, confidence} — not a bare
    // rationale_codes string[], so it wouldn't otherwise be reached by the
    // key check below. Collecting any object's string `code` field
    // unconditionally is safe: HealthFlagSchema/ReviewTriggerSchema/
    // PlanningAssumptionSchema also have a `code` field, but their values
    // are internal tags that never match CITATION_SHAPE below, so they pass
    // through this collection step as harmless no-ops.
    const maybeCode = (value as { code?: unknown }).code;
    if (typeof maybeCode === 'string') {
      out.add(maybeCode);
    }
    for (const [key, val] of Object.entries(value)) {
      // ConditioningPrescription's citation-bearing field is plain
      // `rationale: string[]` — a different key name than
      // `rationale_codes`, so it was previously invisible to this
      // collector (and therefore to both the hallucination check below
      // and narrative synthesis's per-athlete citation pool). Recursing
      // unconditionally afterwards (not in an else branch) means this
      // doesn't skip the `code`-field extraction above for `rationale`
      // arrays that hold StrategyDecision/WeekPlanningDecision objects
      // rather than plain strings.
      if ((key === 'rationale_codes' || key === 'rationale') && Array.isArray(val)) {
        val.forEach((code) => typeof code === 'string' && out.add(code));
      }
      collectRationaleCodes(val, out);
    }
  }
};

// LLM-authored phase/week objects place rationale_codes across ~8 unrelated
// substructures (strategy, policies, phases, weeks). A hallucinated citation
// (a plausible-looking but fake code) would otherwise pass through unchecked.
export const validateEvidenceCitations = (
  programme: LongitudinalOdinProgramme,
): ProgrammeValidationFinding[] => {
  const codes = new Set<string>();
  collectRationaleCodes(programme, codes);

  return [...codes]
    .filter(
      (code) => CITATION_SHAPE.test(code) && !ALL_CITATION_CODES.has(code),
    )
    .map((code) =>
      finding(
        validationCodes.UNKNOWN_RATIONALE_CITATION,
        'warning',
        'prescription_quality',
        `rationale_codes references an unrecognised citation code: ${code}`,
      ),
    );
};
