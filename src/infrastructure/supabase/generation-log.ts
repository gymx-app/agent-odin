import { TooManyRequestsError } from '../../shared/errors/http-errors.js';
import type { SupabaseClientLike } from './supabase.types.js';

type GenerationLogRow = {
  user_id: string;
  step: 'strategy' | 'build';
  tokens_input: number;
  tokens_output: number;
  repair_attempted: boolean;
  athlete_goal?: string | null;
};

export const checkRateLimit = async (
  userId: string,
  step: 'strategy' | 'build',
  adminClient: SupabaseClientLike,
  limitPerDay: number,
): Promise<void> => {
  const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await adminClient
    .from('odin_generation_log')
    .select('id')
    .eq('user_id', userId)
    .eq('step', step)
    .gte('created_at', windowStart);

  if (error) {
    // Fail open — a logging infrastructure issue must not block legitimate users.
    return;
  }

  const count = Array.isArray(data) ? data.length : 0;

  if (count >= limitPerDay) {
    throw new TooManyRequestsError({
      code: 'RATE_LIMIT_EXCEEDED',
      message: `You have reached the limit of ${limitPerDay} strategy generations per day. Try again tomorrow.`,
      details: { limit: limitPerDay, window: '24h', step },
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
