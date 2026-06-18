import { AthleteInputSchema } from '../domain/athlete/athlete-input.schema.js';
import type { AthleteInput } from '../domain/athlete/athlete.types.js';
import { odinError } from '../shared/errors/odin-errors.js';
import type { SupabaseClientLike } from '../infrastructure/supabase/supabase.types.js';

type AthleteProfileRow = {
  id: string;
  user_id: string;
  athlete_data: unknown;
  schema_version: number;
};

export class AthleteProfileRepository {
  constructor(private readonly client: SupabaseClientLike) {}

  async getByUserId(userId: string): Promise<AthleteInput> {
    const result = await this.client
      .from<AthleteProfileRow>('athlete_profiles')
      .select('id,user_id,athlete_data,schema_version')
      .eq('user_id', userId)
      .maybeSingle();

    if (result.error) {
      throw odinError(
        'ATHLETE_PROFILE_NOT_FOUND',
        'Athlete profile was not found.',
        404,
      );
    }

    if (!result.data) {
      throw odinError(
        'ATHLETE_PROFILE_NOT_FOUND',
        'Athlete profile was not found.',
        404,
      );
    }

    const parsed = AthleteInputSchema.safeParse(result.data.athlete_data);

    if (!parsed.success) {
      throw odinError(
        'ATHLETE_PROFILE_INVALID',
        'Stored athlete profile is invalid.',
        422,
      );
    }

    return parsed.data;
  }

  async upsertForUser(
    userId: string,
    athlete: AthleteInput,
  ): Promise<AthleteInput> {
    const parsed = AthleteInputSchema.safeParse(athlete);

    if (!parsed.success) {
      throw odinError('BAD_REQUEST', 'Invalid athlete profile.', 400);
    }

    const result = await this.client
      .from<AthleteProfileRow>('athlete_profiles')
      .upsert(
        {
          user_id: userId,
          athlete_data: parsed.data,
          schema_version: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
      .select('id,user_id,athlete_data,schema_version')
      .single();

    if (result.error || !result.data) {
      throw odinError(
        'ATHLETE_PROFILE_PERSISTENCE_FAILED',
        'Athlete profile could not be saved.',
        500,
      );
    }

    return parsed.data;
  }
}
