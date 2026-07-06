import { describe, expect, it } from 'vitest';
import { checkRateLimit } from '../../src/infrastructure/supabase/generation-log.js';
import type { SupabaseClientLike } from '../../src/infrastructure/supabase/supabase.types.js';

const fakeAdminClient = (rows: Array<{ id: string }>): SupabaseClientLike & { calls: Array<[string, unknown]> } => {
  const calls: Array<[string, unknown]> = [];
  const builder = {
    select: () => builder,
    eq: (column: string, value: unknown) => {
      calls.push([column, value]);
      return builder;
    },
    gte: () => builder,
    then: (onFulfilled: (result: { data: typeof rows; error: null }) => unknown) =>
      onFulfilled({ data: rows, error: null }),
  };
  return { from: () => builder as never, calls } as never;
};

describe('checkRateLimit', () => {
  it('counts only successful build completions, not strategy attempts', async () => {
    const client = fakeAdminClient([{ id: '1' }]);

    await checkRateLimit('user-1', client, 10);

    expect(client.calls).toContainEqual(['step', 'build']);
    expect(client.calls).not.toContainEqual(['step', 'strategy']);
  });

  it('throws once the daily build quota is reached', async () => {
    const client = fakeAdminClient(Array.from({ length: 10 }, (_, i) => ({ id: String(i) })));

    await expect(checkRateLimit('user-1', client, 10)).rejects.toThrow(
      'You have reached the limit of 10 programme generations per day.',
    );
  });

  it('allows the request when under quota', async () => {
    const client = fakeAdminClient(Array.from({ length: 9 }, (_, i) => ({ id: String(i) })));

    await expect(checkRateLimit('user-1', client, 10)).resolves.toBeUndefined();
  });
});
