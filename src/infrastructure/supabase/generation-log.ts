import { TooManyRequestsError } from '../../shared/errors/http-errors.js';
import type { SupabaseClientLike } from './supabase.types.js';

export type GenerationLogStep =
  | 'strategy'
  | 'build'
  | 'phase_prep'
  | 'phase_reasoning'
  | 'phase_tools'
  | 'phase_week'
  | 'assemble';

type GenerationLogRow = {
  user_id: string;
  step: GenerationLogStep;
  tokens_input: number;
  tokens_output: number;
  repair_attempted: boolean;
  repair_reasons?: string[] | null;
  athlete_goal?: string | null;
  status?: 'succeeded' | 'failed';
  error_code?: string | null;
  duration_ms?: number;
  stage_durations_ms?: Record<string, number> | null;
  provider?: 'openai' | 'anthropic' | null;
  model?: string | null;
  planner_version?: string | null;
  narratives_unavailable?: boolean | null;
  narrative_retry_reasons?: string[] | null;
};

export const checkRateLimit = async (
  userId: string,
  adminClient: SupabaseClientLike,
  limitPerDay: number,
): Promise<void> => {
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Counts completed 'build' steps only — a 'strategy' call that never
  // reaches a successful build (e.g. a build-step timeout) is not a
  // generation the user received, so it must not count against the quota.
  const { data, error } = await adminClient
    .from('odin_generation_log')
    .select('id')
    .eq('user_id', userId)
    .eq('step', 'build')
    .gte('created_at', windowStart);

  if (error) {
    // Fail open — a logging infrastructure issue must not block legitimate users.
    return;
  }

  const count = Array.isArray(data) ? data.length : 0;

  if (count >= limitPerDay) {
    throw new TooManyRequestsError({
      code: 'RATE_LIMIT_EXCEEDED',
      message: `You have reached the limit of ${limitPerDay} programme generations per day. Try again tomorrow.`,
      details: { limit: limitPerDay, window: '24h', step: 'build' },
    });
  }
};

export const logGeneration = async (
  adminClient: SupabaseClientLike,
  row: GenerationLogRow,
): Promise<void> => {
  // Fire-and-forget — never block the response on a logging failure.
  try {
    await adminClient
      .from('odin_generation_log')
      .insert(row)
      .then(() => undefined);
  } catch {
    // Silently swallow.
  }
};
