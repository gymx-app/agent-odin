import type { HttpRequest } from './types.js';

const getHeaderValue = (
  value: HttpRequest['headers'][string],
): string | undefined => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const VALID_REQUEST_ID = /^[a-zA-Z0-9_\-:.]{1,128}$/;

export const getRequestId = (request: HttpRequest): string => {
  const incomingRequestId = getHeaderValue(request.headers['x-request-id'])?.trim();

  if (incomingRequestId && VALID_REQUEST_ID.test(incomingRequestId)) {
    return incomingRequestId;
  }

  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `req_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
};
