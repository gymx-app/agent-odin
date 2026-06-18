import { describe, expect, it } from 'vitest';
import { IdempotencyRepository } from '../../src/repositories/idempotency.repository.js';
import { createQueryClient } from './test-supabase-client.js';

describe('IdempotencyRepository', () => {
  it('returns a completed response reference for an identical replay', async () => {
    const { client } = createQueryClient({
      single: {
        data: {
          user_id: 'user-1',
          endpoint: '/api/odin/generate',
          idempotency_key: 'key-1',
          request_hash: 'hash-1',
          response_reference: { programme_id: 'programme-1' },
          status: 'succeeded',
        },
        error: null,
      },
    });

    await expect(
      new IdempotencyRepository(client).claim(
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
    const { client } = createQueryClient({
      single: {
        data: {
          user_id: 'user-1',
          endpoint: '/api/odin/generate',
          idempotency_key: 'key-1',
          request_hash: 'other-hash',
          response_reference: null,
          status: 'started',
        },
        error: null,
      },
    });

    await expect(
      new IdempotencyRepository(client).claim(
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

  it('rejects an in-progress identical request', async () => {
    const { client } = createQueryClient({
      single: {
        data: {
          user_id: 'user-1',
          endpoint: '/api/odin/generate',
          idempotency_key: 'key-1',
          request_hash: 'hash-1',
          response_reference: null,
          status: 'started',
        },
        error: null,
      },
    });

    await expect(
      new IdempotencyRepository(client).claim(
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
});
