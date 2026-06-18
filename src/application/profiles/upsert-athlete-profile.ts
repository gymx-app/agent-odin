import type { AthleteInput } from '../../domain/athlete/athlete.types.js';

export type AthleteProfileWriter = {
  upsertForUser: (userId: string, input: AthleteInput) => Promise<AthleteInput>;
};

export const upsertAthleteProfile = (
  userId: string,
  input: AthleteInput,
  repository: AthleteProfileWriter,
): Promise<AthleteInput> => repository.upsertForUser(userId, input);
