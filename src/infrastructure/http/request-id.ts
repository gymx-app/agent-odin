import type { HttpRequest } from './types.js';

const getHeaderValue = (
  value: HttpRequest['headers'][string],
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const getRequestId = (request: HttpRequest): string => {
  const incomingRequestId = getHeaderValue(request.headers['x-request-id']);

  if (incomingRequestId && incomingRequestId.trim().length > 0) {
    return incomingRequestId.trim();
  }

  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `req_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
};
