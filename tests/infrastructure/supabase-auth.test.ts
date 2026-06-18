import { describe, expect, it } from 'vitest';
import {
  readBearerToken,
  requireAuthenticatedUser,
} from '../../src/infrastructure/supabase/auth.js';
import type { SupabaseAuthClientLike } from '../../src/infrastructure/supabase/supabase.types.js';
import { createTestRequest } from './test-http.js';

const authClient = (
  result: Awaited<ReturnType<SupabaseAuthClientLike['auth']['getUser']>>,
): SupabaseAuthClientLike =>
  ({
    auth: {
      getUser: async () => result,
    },
  }) as SupabaseAuthClientLike;

describe('Supabase authentication helper', () => {
  it('reads a bearer token', () => {
    expect(
      readBearerToken(
        createTestRequest({
          headers: {
            authorization: 'Bearer token-123',
          },
        }),
      ),
    ).toBe('token-123');
  });

  it('rejects missing authorization headers', () => {
    expect(() => readBearerToken(createTestRequest())).toThrow(
      'Authorization header is required.',
    );
  });

  it('rejects malformed authorization headers', () => {
    expect(() =>
      readBearerToken(
        createTestRequest({
          headers: {
            authorization: 'Basic nope',
          },
        }),
      ),
    ).toThrow('Authorization header must use Bearer authentication.');
  });

  it('returns the verified user and ignores body-supplied identities', async () => {
    const user = await requireAuthenticatedUser(
      createTestRequest({
        headers: {
          authorization: 'Bearer valid',
        },
        body: {
          user_id: 'attacker-controlled',
        },
      }),
      authClient({
        data: {
          user: {
            id: 'verified-user',
            email: 'user@example.com',
            app_metadata: { role: 'authenticated' },
            user_metadata: { name: 'Rohan' },
          },
        },
        error: null,
      }),
    );

    expect(user.id).toBe('verified-user');
    expect(user.email).toBe('user@example.com');
  });

  it('maps invalid or expired tokens to a safe auth error', async () => {
    await expect(
      requireAuthenticatedUser(
        createTestRequest({
          headers: {
            authorization: 'Bearer expired',
          },
        }),
        authClient({
          data: {
            user: null,
          },
          error: { message: 'JWT expired' },
        }),
      ),
    ).rejects.toMatchObject({
      code: 'AUTH_TOKEN_INVALID',
      httpStatus: 401,
    });
  });
});
