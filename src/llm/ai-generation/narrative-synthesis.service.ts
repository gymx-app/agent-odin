import type { AiProgrammeGenerationProvider } from './ai-programme-generation-provider.js';
import { CITATION_REGISTRY, type CitationEntry } from '../../planning/evidence.js';
import { narrativeSynthesisSystemPrompt } from './narrative-synthesis-prompt.js';
import {
  NarrativeSynthesisOutputSchema,
  type NarrativeSynthesisOutput,
  type NarrativeSentence,
} from './narrative-contract.schema.js';

const MAX_NARRATIVE_RETRIES = 3;

export type NarrativeSynthesisInput = {
  profile: Record<string, unknown>;
  rationale: Record<string, unknown>;
  validation_findings: Array<{ code: string; message: string; severity: string }>;
  citation_codes: string[];
};

export type CitationOutputEntry = CitationEntry & {
  code: string;
  referenced_by: string[];
};

export type NarrativeSynthesisResult =
  | {
      narratives: NarrativeSynthesisOutput;
      citations: CitationOutputEntry[];
      narratives_unavailable: false;
    }
  | {
      narratives: null;
      citations: null;
      narratives_unavailable: true;
      // Server-side diagnostics only — not part of the public API response,
      // logged so a failure is debuggable without reproducing it by hand.
      retry_reasons: string[];
    };

const buildCitations = (output: NarrativeSynthesisOutput): CitationOutputEntry[] => {
  const referencedBy = new Map<string, Set<string>>();
  const record = (label: string, narrative: NarrativeSentence) =>
    (narrative.citation_codes ?? []).forEach((code) => {
      if (!referencedBy.has(code)) referencedBy.set(code, new Set());
      referencedBy.get(code)!.add(label);
    });

  record('overall', output.overall);
  output.phases.forEach((p) => record(`phase:${p.phase_id}`, p.narrative));
  output.day_patterns.forEach((d) =>
    record(`day_pattern:${d.pattern_label}`, d.narrative),
  );
  output.conditioning_finishers.forEach((c) =>
    record(`conditioning_finisher:${c.day_id}`, c.narrative),
  );

  return [...referencedBy.entries()]
    .filter(([code]) => code in CITATION_REGISTRY)
    .map(([code, labels]) => ({
      code,
      ...CITATION_REGISTRY[code]!,
      referenced_by: [...labels],
    }));
};

export const synthesizeNarratives = async (
  input: NarrativeSynthesisInput,
  provider: AiProgrammeGenerationProvider,
  requestId: string,
): Promise<NarrativeSynthesisResult> => {
  if (!provider.generateNarrativeSynthesis) {
    return {
      narratives: null,
      citations: null,
      narratives_unavailable: true,
      retry_reasons: ['provider does not implement generateNarrativeSynthesis'],
    };
  }

  const citationData = Object.fromEntries(
    input.citation_codes
      .filter((code) => code in CITATION_REGISTRY)
      .map((code) => [code, CITATION_REGISTRY[code]!]),
  );

  let retryFeedback: { messages: string[] } | null = null;
  const allRetryReasons: string[] = [];

  for (let attempt = 0; attempt < MAX_NARRATIVE_RETRIES; attempt++) {
    try {
      const result = await provider.generateNarrativeSynthesis(
        {
          systemPrompt: narrativeSynthesisSystemPrompt,
          userContent: {
            athlete_profile: input.profile,
            rationale: input.rationale,
            validation_findings: input.validation_findings,
            citation_data: citationData,
            retry_feedback: retryFeedback,
          },
        },
        { requestId },
      );

      // Re-validated here (not just by the provider) because the OpenAI path
      // strips .refine() to build a structured-output-compatible schema —
      // this is the only place the goal/profile-fact contract is enforced
      // for both providers uniformly.
      const parsed = NarrativeSynthesisOutputSchema.safeParse(result.output);

      if (parsed.success) {
        return {
          narratives: parsed.data,
          citations: buildCitations(parsed.data),
          narratives_unavailable: false,
        };
      }

      const messages = parsed.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`,
      );
      retryFeedback = { messages };
      allRetryReasons.push(`attempt ${attempt}: ${messages.join('; ')}`);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      retryFeedback = { messages: ['Narrative generation request failed; retry.'] };
      allRetryReasons.push(`attempt ${attempt}: threw — ${detail}`);
    }
  }

  return {
    narratives: null,
    citations: null,
    narratives_unavailable: true,
    retry_reasons: allRetryReasons,
  };
};
