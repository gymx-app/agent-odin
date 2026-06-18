import { createClient } from '@supabase/supabase-js';
import type { AppConfig } from '../config/env.schema.js';
import { odinError } from '../../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from './supabase.types.js';

export const createSupabaseAdminClient = (
  config: AppConfig,
): SupabaseClientLike => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw odinError(
      'SUPABASE_CONFIG_MISSING',
      'Supabase admin configuration is missing.',
      500,
    );
  }

  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }) as unknown as SupabaseClientLike;
};
