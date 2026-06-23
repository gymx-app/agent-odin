import OpenAI from 'openai';
import type { AppConfig } from '../infrastructure/config/env.schema.js';
import { refinementError } from './refinement-errors.js';

export const createOpenAIClient = (config: AppConfig): OpenAI => {
  if (!config.openaiApiKey) {
    throw refinementError(
      'OPENAI_CONFIGURATION_MISSING',
      'OPENAI_API_KEY is required for OpenAI features.',
    );
  }

  return new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: config.openaiTimeoutMs,
    maxRetries: config.openaiMaxRetries,
  });
};
