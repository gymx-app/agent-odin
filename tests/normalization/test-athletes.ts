import type { AthleteInput } from '../../src/domain/athlete/athlete.types.js';
import { beginnerFatLossAthlete } from '../../fixtures/athletes/valid-athletes.js';

export const createAthlete = (
  patch: Partial<AthleteInput> = {},
): AthleteInput => ({
  ...beginnerFatLossAthlete,
  ...patch,
});

export const completeInBody = {
  body_fat_pct: 24,
  smm_kg: 35,
  visceral_fat_area: 80,
  bmr: 1700,
  segmental_balance: {
    left_arm: 1,
    right_arm: 1,
    left_leg: 1,
    right_leg: 1,
    trunk: 1,
  },
};
