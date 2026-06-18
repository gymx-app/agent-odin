import { createClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/env.schema.js';
import { odinError } from '../../shared/errors/odin-errors.js';
import type { SupabaseAuthClientLike } from './supabase.types.js';

export const createSupabaseAuthClient = (
  config: AppConfig,
): SupabaseAuthClientLike => {
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw odinError(
      'SUPABASE_CONFIG_MISSING',
      'Supabase authentication configuration is missing.',
      500,
    );
  }

  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) as unknown as SupabaseAuthClientLike;
};
