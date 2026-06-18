import { UnauthorizedError } from '../../shared/errors/http-errors.js';
import type { HttpRequest } from '../http/types.js';
import type { SupabaseAuthClientLike } from './supabase.types.js';

export type AuthenticatedUser = {
  id: string;
  email: string | null;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
};

const firstHeaderValue = (
  value: HttpRequest['headers'][string],
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const readBearerToken = (request: HttpRequest): string => {
  const authorization =
    firstHeaderValue(request.headers.authorization) ??
    firstHeaderValue(request.headers.Authorization);

  if (!authorization) {
    throw new UnauthorizedError({
      code: 'AUTHORIZATION_HEADER_MISSING',
      message: 'Authorization header is required.',
    });
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match?.[1]) {
    throw new UnauthorizedError({
      code: 'AUTHORIZATION_HEADER_INVALID',
      message: 'Authorization header must use Bearer authentication.',
    });
  }

  return match[1].trim();
};

export const requireAuthenticatedUser = async (
  request: HttpRequest,
  authClient: SupabaseAuthClientLike,
): Promise<AuthenticatedUser> => {
  const token = readBearerToken(request);
  const { data, error } = await authClient.auth.getUser(token);

  if (error || !data.user?.id) {
    throw new UnauthorizedError({
      code: 'AUTH_TOKEN_INVALID',
      message: 'Access token is invalid.',
    });
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    appMetadata: data.user.app_metadata ?? {},
    userMetadata: data.user.user_metadata ?? {},
  };
};
