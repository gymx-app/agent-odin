import { z } from 'zod';

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
  })
  .superRefine((env, context) => {
    if (!env.ODIN_LLM_REFINEMENT_ENABLED) {
      return;
    }

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
      ...parsed.data.ALLOWED_ORIGINS,
      ...(parsed.data.GYMX_ALLOWED_ORIGIN
        ? [parsed.data.GYMX_ALLOWED_ORIGIN]
        : []),
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
  };
};
