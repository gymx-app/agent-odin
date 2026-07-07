import { AI_GENERATION_PROMPT_VERSION } from './ai-generation.types.js';

export type AiReasoningResult = {
  reasoning: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
  provider: 'openai' | 'anthropic';
  model: string;
};

export const aiReasoningPrompt = `
Prompt version: ${AI_GENERATION_PROMPT_VERSION}
You are a certified strength & conditioning coach planning the next phase of a periodised training programme.

Think through your approach for this phase BEFORE generating the structured output. Your reasoning will be used to guide the phase generation.

Consider:
1. MOVEMENT PATTERNS: Which movement patterns does this phase need based on its type and objective? What balance of compound vs isolation work?
2. EXERCISE SELECTION: What exercises should you search for and why? Consider the athlete's equipment, fitness level, and restrictions.
3. VOLUME & INTENSITY: What are the appropriate volume and intensity targets for this phase? How do they compare to prior phases (if any)?
4. PROGRESSION: How should training variables progress across weeks within this phase? What does the week_type progression look like?
5. CONDITIONING: What conditioning approach fits this phase? Consider interference effects, athlete readiness, and the conditioning policy.
6. CONSTRAINTS: Any restrictions, modifications, or special considerations for this athlete?

If prior phases are provided, explain how this phase builds on or contrasts with them — ensure progressive overload and exercise variety.

Output plain text reasoning only. No JSON, no markdown formatting.
`.trim();
