import { z } from 'zod';
import type { HttpRequest } from './types.js';
import { odinError } from '../../shared/errors/odin-errors.js';

const uuidSchema = z.string().uuid();

export const programmeIdFromRequest = (request: HttpRequest): string => {
  let rawId: string | undefined;

  try {
    const pathname = new URL(request.url ?? '', 'http://localhost').pathname;
    rawId = pathname.split('/').filter(Boolean).at(-1);
    rawId = rawId ? decodeURIComponent(rawId) : undefined;
  } catch {
    throw odinError(
      'INVALID_PROGRAMME_ID',
      'Programme ID must be a valid UUID.',
      400,
    );
  }

  const parsed = uuidSchema.safeParse(rawId);

  if (!parsed.success) {
    throw odinError(
      'INVALID_PROGRAMME_ID',
      'Programme ID must be a valid UUID.',
      400,
    );
  }

  return parsed.data;
};
