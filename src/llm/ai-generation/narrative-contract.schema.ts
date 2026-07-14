import { z } from 'zod';

export const NarrativeSentenceSchema = z
  .object({
    text: z.string().min(1),
    references_goal: z.boolean(),
    references_profile_fact: z.boolean(),
    source_fields: z.array(z.string().min(1)),
    citation_codes: z.array(z.string().min(1)).optional(),
  })
  .refine((n) => n.references_goal && n.references_profile_fact, {
    message:
      'Narrative sentence must reference both the athlete goal and a specific profile fact',
  });

export type NarrativeSentence = z.infer<typeof NarrativeSentenceSchema>;

export const NarrativeSynthesisOutputSchema = z.object({
  overall: NarrativeSentenceSchema,
  phases: z.array(
    z.object({ phase_id: z.string().min(1), narrative: NarrativeSentenceSchema }),
  ),
  day_patterns: z.array(
    z.object({
      pattern_label: z.string().min(1),
      narrative: NarrativeSentenceSchema,
    }),
  ),
  conditioning_finishers: z.array(
    z.object({ day_id: z.string().min(1), narrative: NarrativeSentenceSchema }),
  ),
});

export type NarrativeSynthesisOutput = z.infer<typeof NarrativeSynthesisOutputSchema>;
