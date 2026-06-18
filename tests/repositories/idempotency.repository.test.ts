import { describe, expect, it } from 'vitest';
import { IdempotencyRepository } from '../../src/repositories/idempotency.repository.js';
import { createQueryClient } from './test-supabase-client.js';

const repositoryFor = (
  outcome: 'started' | 'replay' | 'conflict' | 'in_progress',
  responseReference: Record<string, unknown> | null = null,
) =>
  new IdempotencyRepository(
    createQueryClient({
      rpc: {
        data: { outcome, response_reference: responseReference },
        error: null,
      },
    }).client,
  );

describe('IdempotencyRepository', () => {
  it('claims a new, expired, or retryable request through the atomic RPC', async () => {
    await expect(
      repositoryFor('started').claim(
        'user-1',
        '/api/odin/generate',
        'key-1',
        'hash-1',
      ),
    ).resolves.toEqual({ type: 'started' });
  });

  it('returns a completed response reference for an identical replay', async () => {
    await expect(
      repositoryFor('replay', { programme_id: 'programme-1' }).claim(
        'user-1',
        '/api/odin/generate',
        'key-1',
        'hash-1',
      ),
    ).resolves.toEqual({
      type: 'replay',
      responseReference: { programme_id: 'programme-1' },
    });
  });

  it('rejects the same key with a different request body', async () => {
    await expect(
      repositoryFor('conflict').claim(
        'user-1',
        '/api/odin/generate',
        'key-1',
        'hash-1',
      ),
    ).rejects.toMatchObject({
      code: 'IDEMPOTENCY_KEY_CONFLICT',
      httpStatus: 409,
    });
  });

  it('rejects a non-expired in-progress request', async () => {
    await expect(
      repositoryFor('in_progress').claim(
        'user-1',
        '/api/odin/generate',
        'key-1',
        'hash-1',
      ),
    ).rejects.toMatchObject({
      code: 'IDEMPOTENCY_REQUEST_IN_PROGRESS',
      httpStatus: 409,
    });
  });

  it('marks a failed request through the guarded RPC', async () => {
    const { client, calls } = createQueryClient({
      rpc: { data: true, error: null },
    });

    await new IdempotencyRepository(client).markFailed(
      'user-1',
      '/api/odin/generate',
      'key-1',
      'hash-1',
    );

    expect(calls).toContainEqual({
      method: 'rpc',
      args: [
        'mark_idempotency_failed',
        {
          p_user_id: 'user-1',
          p_endpoint: '/api/odin/generate',
          p_idempotency_key: 'key-1',
          p_request_hash: 'hash-1',
        },
      ],
    });
  });
});
