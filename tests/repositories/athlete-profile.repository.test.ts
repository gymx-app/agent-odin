import { describe, expect, it } from 'vitest';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';
import { AthleteProfileRepository } from '../../src/repositories/athlete-profile.repository.js';
import { createQueryClient } from './test-supabase-client.js';

describe('AthleteProfileRepository', () => {
  it('loads and validates an athlete profile for the requested user', async () => {
    const { client, calls } = createQueryClient({
      single: {
        data: {
          id: 'profile-1',
          user_id: 'user-1',
          athlete_data: beginnerFatLossAthlete,
          schema_version: 1,
        },
        error: null,
      },
    });

    await expect(
      new AthleteProfileRepository(client).getByUserId('user-1'),
    ).resolves.toStrictEqual(beginnerFatLossAthlete);
    expect(calls).toContainEqual({
      method: 'eq',
      args: ['user_id', 'user-1'],
    });
  });

  it('returns a safe not-found error', async () => {
    const { client } = createQueryClient({
      single: { data: null, error: null },
    });

    await expect(
      new AthleteProfileRepository(client).getByUserId('user-1'),
    ).rejects.toMatchObject({
      code: 'ATHLETE_PROFILE_NOT_FOUND',
      httpStatus: 404,
    });
  });

  it('rejects invalid stored JSON', async () => {
    const { client } = createQueryClient({
      single: {
        data: {
          id: 'profile-1',
          user_id: 'user-1',
          athlete_data: { goal: 'invalid' },
          schema_version: 1,
        },
        error: null,
      },
    });

    await expect(
      new AthleteProfileRepository(client).getByUserId('user-1'),
    ).rejects.toMatchObject({
      code: 'ATHLETE_PROFILE_INVALID',
    });
  });
});
