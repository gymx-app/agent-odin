import { z } from 'zod';
import {
  PlannerVersionSchema,
  type PlannerVersion,
} from '../../domain/programme/planner-version.js';

const commaSeparatedOriginsSchema = z
  .string()
  .optional()
  .transform((value) =>
    value
      ? value
          .split(',')
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0)
      : [],
  );

const booleanStringSchema = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

const plannerVersionsSchema = z
  .string()
  .default('legacy_v1,longitudinal_v1,ai_agent_v1')
  .transform((value, context) => {
    const versions = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const parsed = z.array(PlannerVersionSchema).safeParse(versions);
    if (!parsed.success || parsed.data.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'ODIN_ALLOWED_PLANNER_VERSIONS is invalid.',
      });
      return z.NEVER;
    }
    return [...new Set(parsed.data)];
  });

const optionalSecretSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    APP_VERSION: z.string().trim().min(1).default('0.1.0'),
    ALLOWED_ORIGINS: commaSeparatedOriginsSchema,
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_ANON_KEY: z.string().trim().min(1).optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().trim().min(1).optional(),
    GYMX_ALLOWED_ORIGIN: z.string().url().optional(),
    OPENAI_API_KEY: optionalSecretSchema,
    OPENAI_MODEL: optionalSecretSchema,
    OPENAI_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .max(120000)
      .default(20000),
    OPENAI_MAX_RETRIES: z.coerce.number().int().min(0).max(1).default(1),
    ODIN_LLM_REFINEMENT_ENABLED: booleanStringSchema,
    ODIN_GENERATION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(5000)
      .max(120000)
      .default(60000),
    ODIN_DEFAULT_PLANNER_VERSION: PlannerVersionSchema.default('legacy_v1'),
    ODIN_LONGITUDINAL_PLANNER_ENABLED: booleanStringSchema,
    ODIN_AI_AGENT_PLANNER_ENABLED: z
      .enum(['true', 'false'])
      .optional()
      .default('true')
      .transform((value) => value === 'true'),
    ODIN_ALLOWED_PLANNER_VERSIONS: plannerVersionsSchema,
    OPENAI_GENERATION_MODEL: optionalSecretSchema,
    OPENAI_GENERATION_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(5000)
      .max(300000)
      .default(45000),
    AI_GENERATION_PROVIDER: z
      .enum(['openai', 'anthropic'])
      .optional()
      .default('openai'),
    ANTHROPIC_API_KEY: optionalSecretSchema,
    ANTHROPIC_MODEL: optionalSecretSchema,
    ANTHROPIC_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(5000)
      .max(300000)
      .default(45000),
  })
  .superRefine((env, context) => {
    if (!env.ODIN_LLM_REFINEMENT_ENABLED) {
      // Planner rollout validation remains active without LLM refinement.
    } else {
      if (!env.OPENAI_API_KEY) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['OPENAI_API_KEY'],
          message: 'OPENAI_API_KEY is required when refinement is enabled.',
        });
      }

      if (!env.OPENAI_MODEL) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['OPENAI_MODEL'],
          message: 'OPENAI_MODEL is required when refinement is enabled.',
        });
      }
    }
    if (
      !env.ODIN_ALLOWED_PLANNER_VERSIONS.includes(
        env.ODIN_DEFAULT_PLANNER_VERSION,
      )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ODIN_DEFAULT_PLANNER_VERSION'],
        message: 'Default planner version must be allowed.',
      });
    }
  });

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  appVersion: string;
  allowedOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  openaiApiKey: string | null;
  openaiModel: string | null;
  openaiTimeoutMs: number;
  openaiMaxRetries: number;
  llmRefinementEnabled: boolean;
  generationTimeoutMs: number;
  defaultPlannerVersion: PlannerVersion;
  longitudinalPlannerEnabled: boolean;
  aiAgentPlannerEnabled: boolean;
  allowedPlannerVersions: PlannerVersion[];
  openaiGenerationModel: string | null;
  openaiGenerationTimeoutMs: number;
  aiGenerationProvider: 'openai' | 'anthropic';
  anthropicApiKey: string | null;
  anthropicModel: string | null;
  anthropicTimeoutMs: number;
};

export type RawEnv = Partial<Record<keyof z.input<typeof envSchema>, string>>;

export const parseEnv = (rawEnv: RawEnv): AppConfig => {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');

    throw new Error(`Invalid environment configuration: ${message}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    appVersion: parsed.data.APP_VERSION,
    allowedOrigins: [
      ...new Set([
        ...parsed.data.ALLOWED_ORIGINS,
        ...(parsed.data.GYMX_ALLOWED_ORIGIN
          ? [parsed.data.GYMX_ALLOWED_ORIGIN]
          : []),
      ]),
    ],
    logLevel: parsed.data.LOG_LEVEL,
    supabaseUrl: parsed.data.SUPABASE_URL ?? null,
    supabaseAnonKey: parsed.data.SUPABASE_ANON_KEY ?? null,
    supabaseServiceRoleKey: parsed.data.SUPABASE_SERVICE_ROLE_KEY ?? null,
    openaiApiKey: parsed.data.OPENAI_API_KEY ?? null,
    openaiModel: parsed.data.OPENAI_MODEL ?? null,
    openaiTimeoutMs: parsed.data.OPENAI_TIMEOUT_MS,
    openaiMaxRetries: parsed.data.OPENAI_MAX_RETRIES,
    llmRefinementEnabled: parsed.data.ODIN_LLM_REFINEMENT_ENABLED,
    generationTimeoutMs: parsed.data.ODIN_GENERATION_TIMEOUT_MS,
    defaultPlannerVersion: parsed.data.ODIN_DEFAULT_PLANNER_VERSION,
    longitudinalPlannerEnabled: parsed.data.ODIN_LONGITUDINAL_PLANNER_ENABLED,
    aiAgentPlannerEnabled: parsed.data.ODIN_AI_AGENT_PLANNER_ENABLED,
    allowedPlannerVersions: parsed.data.ODIN_ALLOWED_PLANNER_VERSIONS,
    openaiGenerationModel: parsed.data.OPENAI_GENERATION_MODEL ?? parsed.data.OPENAI_MODEL ?? null,
    openaiGenerationTimeoutMs: parsed.data.OPENAI_GENERATION_TIMEOUT_MS,
    aiGenerationProvider: parsed.data.AI_GENERATION_PROVIDER,
    anthropicApiKey: parsed.data.ANTHROPIC_API_KEY ?? null,
    anthropicModel: parsed.data.ANTHROPIC_MODEL ?? null,
    anthropicTimeoutMs: parsed.data.ANTHROPIC_TIMEOUT_MS,
  };
};
