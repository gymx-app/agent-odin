import type { HeaderValue } from './types.js';

export const firstHeaderValue = (value: HeaderValue): string | undefined =>
  Array.isArray(value) ? value[0] : value;
