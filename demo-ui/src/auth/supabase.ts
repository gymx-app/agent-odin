import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (
    import.meta.env.VITE_SUPABASE_URL ??
    import.meta.env.SUPABASE_URL
  )?.trim() ?? '';
const supabaseAnonKey =
  (
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.SUPABASE_ANON_KEY
  )?.trim() ?? '';

export const isSupabaseAuthConfigured = Boolean(
  supabaseUrl && supabaseAnonKey,
);

export const supabaseAuth = isSupabaseAuthConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
