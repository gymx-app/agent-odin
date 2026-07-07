import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { AppConfig } from '../../infrastructure/config/env.schema.js';
import { odinError } from '../../shared/errors/odin-errors.js';
import { BadRequestError } from '../../shared/errors/http-errors.js';
import { OpenAIAiProgrammeGenerationProvider } from './openai-ai-programme-generation-provider.js';
import { AnthropicAiProgrammeGenerationProvider } from './anthropic-ai-programme-generation-provider.js';
import { AiStrategyOutputSchema } from './ai-generation.schema.js';
import type { AiStrategyOutput } from './ai-generation.types.js';
import type { AiProgrammeGenerationProvider } from './ai-programme-generation-provider.js';

export const PhaseSummarySchema = z.object({
  phase_id: z.string().min(1),
  phase_type: z.string().min(1),
  objective: z.string().min(1),
  exercises_used: z.array(z.string()),
  volume_per_muscle_group: z.record(z.number()),
  progression_model: z.string().min(1),
});

export const ToolConversationItemSchema = z.record(z.unknown());

export const stripNulls = (obj: unknown): unknown => {
  if (obj === null) return undefined;
  if (Array.isArray(obj)) return obj.map(stripNulls);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const stripped = stripNulls(v);
      if (stripped !== undefined) result[k] = stripped;
    }
    return result;
  }
  return obj;
};

export const DAY_OF_WEEK = [
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT',
  'SUN',
] as const;

// Used for phase_prep/reasoning/tools/week steps where strategy comes from the client.
// For the build step, use coerceStrategy (more lenient — LLM may null optional fields).
export const parseStrategy = (
  raw: unknown,
): z.infer<typeof AiStrategyOutputSchema> => {
  try {
    return AiStrategyOutputSchema.parse(stripNulls(raw));
  } catch (err) {
    throw new BadRequestError({
      message: `Strategy validation failed: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
};

// Lenient strategy coercion for the build step: fixes nulled optional fields that the
// LLM may output (OpenAI schema converts optional→nullable, stripNulls then removes them,
// but CalendarSchema.superRefine rejects missing day_of_week on weekly cycles).
export const coerceStrategy = (raw: unknown): AiStrategyOutput => {
  const stripped = stripNulls(raw) as Record<string, unknown>;
  const calendar = stripped.calendar as Record<string, unknown> | undefined;
  if (calendar?.cycle_type === 'weekly' && Array.isArray(calendar.days)) {
    calendar.days = (calendar.days as Array<Record<string, unknown>>).map(
      (day, i) => {
        if (day.day_of_week === undefined || day.day_of_week === null) {
          return { ...day, day_of_week: DAY_OF_WEEK[i % 7] };
        }
        return day;
      },
    );
  }
  return stripped as unknown as AiStrategyOutput;
};

export const getProvider = (
  appConfig: AppConfig,
): AiProgrammeGenerationProvider => {
  if (
    appConfig.aiGenerationProvider === 'anthropic' &&
    appConfig.anthropicApiKey
  ) {
    return new AnthropicAiProgrammeGenerationProvider(
      new Anthropic({
        apiKey: appConfig.anthropicApiKey,
        timeout: appConfig.anthropicTimeoutMs,
        maxRetries: 0,
      }),
      appConfig,
    );
  }

  if (appConfig.openaiApiKey) {
    return new OpenAIAiProgrammeGenerationProvider(
      new OpenAI({
        apiKey: appConfig.openaiApiKey,
        timeout: appConfig.openaiGenerationTimeoutMs,
        maxRetries: 0,
      }),
      appConfig,
    );
  }

  throw odinError(
    'AI_GENERATION_PROVIDER_MISSING',
    'No AI generation provider configured.',
    500,
  );
};
