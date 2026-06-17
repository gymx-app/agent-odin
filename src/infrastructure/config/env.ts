import { parseEnv, type AppConfig, type RawEnv } from './env.schema.js';

declare const process: {
  env: RawEnv;
};

export const loadEnv = (rawEnv: RawEnv = process.env): AppConfig =>
  parseEnv(rawEnv);

export const config = loadEnv();
