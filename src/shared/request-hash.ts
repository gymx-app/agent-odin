import { createHash } from 'node:crypto';
import { canonicalizeJson } from './canonical-json.js';

export const hashIdempotentRequest = (value: unknown): string =>
  createHash('sha256').update(canonicalizeJson(value), 'utf8').digest('hex');
