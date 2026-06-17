import type { AppConfig } from '../config/env.schema.js';

export type LogLevel = AppConfig['logLevel'];

export type LogMetadata = Record<string, unknown>;

export type Logger = {
  debug: (message: string, metadata?: LogMetadata) => void;
  info: (message: string, metadata?: LogMetadata) => void;
  warn: (message: string, metadata?: LogMetadata) => void;
  error: (message: string, metadata?: LogMetadata) => void;
};

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const shouldLog = (configuredLevel: LogLevel, level: LogLevel): boolean =>
  levelPriority[level] >= levelPriority[configuredLevel];

export const createLogger = (config: Pick<AppConfig, 'logLevel'>): Logger => {
  const write = (
    level: LogLevel,
    message: string,
    metadata: LogMetadata = {},
  ) => {
    if (!shouldLog(config.logLevel, level)) {
      return;
    }

    const entry = {
      level,
      timestamp: new Date().toISOString(),
      message,
      ...metadata,
    };

    const serializedEntry = JSON.stringify(entry);

    if (level === 'error') {
      console.error(serializedEntry);
      return;
    }

    if (level === 'warn') {
      console.warn(serializedEntry);
      return;
    }

    console.log(serializedEntry);
  };

  return {
    debug: (message, metadata) => write('debug', message, metadata),
    info: (message, metadata) => write('info', message, metadata),
    warn: (message, metadata) => write('warn', message, metadata),
    error: (message, metadata) => write('error', message, metadata),
  };
};
