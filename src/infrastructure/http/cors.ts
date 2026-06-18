import type { AppConfig } from '../config/env.schema.js';
import type { HttpMethod, HttpRequest, HttpResponse } from './types.js';

const corsMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'OPTIONS'];
const corsHeaders = ['Content-Type', 'Authorization', 'Idempotency-Key'];

const firstHeaderValue = (
  value: HttpRequest['headers'][string],
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const isLocalhostOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);

    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname === '[::1]'
    );
  } catch {
    return false;
  }
};

export type CorsResult = {
  origin: string | null;
  allowed: boolean;
};

export const getCorsOrigin = (
  request: HttpRequest,
  config: AppConfig,
): CorsResult => {
  const origin = firstHeaderValue(request.headers.origin);

  if (!origin) {
    return {
      origin: null,
      allowed: true,
    };
  }

  const isAllowedOrigin =
    config.allowedOrigins.includes(origin) ||
    (config.nodeEnv === 'development' && isLocalhostOrigin(origin));

  return {
    origin,
    allowed: isAllowedOrigin,
  };
};

export const applyCorsHeaders = (
  response: HttpResponse,
  request: HttpRequest,
  config: AppConfig,
): CorsResult => {
  const result = getCorsOrigin(request, config);

  response.setHeader('Vary', 'Origin');

  if (result.allowed && result.origin) {
    response.setHeader('Access-Control-Allow-Origin', result.origin);
  }

  response.setHeader('Access-Control-Allow-Methods', corsMethods.join(', '));
  response.setHeader('Access-Control-Allow-Headers', corsHeaders.join(', '));

  return result;
};
