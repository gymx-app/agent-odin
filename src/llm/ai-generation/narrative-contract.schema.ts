import { z, type ZodTypeAny } from 'zod';

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

// Strips only .refine() (unlike openai-schema-compat's toOpenAISchema, which
// also turns .optional() into .nullable() to satisfy OpenAI's structured-output
// API — a constraint Anthropic doesn't have). Used for provider-side JSON-shape
// validation only; the goal/profile-fact contract itself is enforced by
// narrative-synthesis.service.ts re-validating against the full schema above,
// where a citation_codes field the LLM was told to omit stays omittable.
const stripRefinements = (schema: ZodTypeAny): ZodTypeAny => {
  if (schema instanceof z.ZodEffects) return stripRefinements(schema.innerType());
  if (schema instanceof z.ZodOptional) return stripRefinements(schema.unwrap()).optional();
  if (schema instanceof z.ZodNullable) return stripRefinements(schema.unwrap()).nullable();
  if (schema instanceof z.ZodArray) return z.array(stripRefinements(schema.element));
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, ZodTypeAny>;
    const newShape: Record<string, ZodTypeAny> = {};
    for (const [key, value] of Object.entries(shape)) {
      newShape[key] = stripRefinements(value);
    }
    return z.object(newShape);
  }
  return schema;
};

export const NarrativeSynthesisStructuralSchema = stripRefinements(
  NarrativeSynthesisOutputSchema,
);
