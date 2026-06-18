import OpenAI from 'openai';
import type { AppConfig } from '../infrastructure/config/env.schema.js';
import { refinementError } from './refinement-errors.js';

export const createOpenAIClient = (config: AppConfig): OpenAI => {
  if (
    !config.llmRefinementEnabled ||
    !config.openaiApiKey ||
    !config.openaiModel
  ) {
    throw refinementError(
      'OPENAI_CONFIGURATION_MISSING',
      'OpenAI refinement configuration is missing.',
    );
  }

  return new OpenAI({
    apiKey: config.openaiApiKey,
    timeout: config.openaiTimeoutMs,
    maxRetries: config.openaiMaxRetries,
  });
};
