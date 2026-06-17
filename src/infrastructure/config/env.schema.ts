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

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_VERSION: z.string().trim().min(1).default('0.1.0'),
  ALLOWED_ORIGINS: commaSeparatedOriginsSchema,
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type AppConfig = {
  nodeEnv: 'development' | 'test' | 'production';
  appVersion: string;
  allowedOrigins: string[];
  logLevel: 'debug' | 'info' | 'warn' | 'error';
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
    allowedOrigins: parsed.data.ALLOWED_ORIGINS,
    logLevel: parsed.data.LOG_LEVEL,
  };
};
