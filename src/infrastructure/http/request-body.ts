import { z } from 'zod';
import type { HttpRequest } from './types.js';
import {
  BadRequestError,
  PayloadTooLargeError,
} from '../../shared/errors/http-errors.js';
import { firstHeaderValue } from './headers.js';
import { REQUEST_BODY_LIMITS } from './request-limits.js';

const byteLength = (str: string): number =>
  typeof Buffer !== 'undefined'
    ? Buffer.byteLength(str, 'utf8')
    : new TextEncoder().encode(str).byteLength;

const payloadTooLarge = (): PayloadTooLargeError => new PayloadTooLargeError();

const parseContentLength = (
  request: HttpRequest,
  maximumBytes: number,
): void => {
  const value = firstHeaderValue(request.headers['content-length']);

  if (value === undefined) {
    return;
  }

  if (!/^\d+$/.test(value)) {
    throw new BadRequestError({
      message: 'Content-Length must be a non-negative integer.',
    });
  }

  if (Number(value) > maximumBytes) {
    throw payloadTooLarge();
  }
};

const readStreamBody = async (
  request: HttpRequest,
  maximumBytes: number,
): Promise<string> => {
  if (!request.on) {
    return '';
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytes = 0;
    let rejected = false;

    request.on?.('data', (chunk) => {
      if (rejected || (typeof chunk !== 'string' && !Buffer.isBuffer(chunk))) {
        return;
      }

      const buffer = Buffer.from(chunk);
      bytes += buffer.byteLength;

      if (bytes > maximumBytes) {
        rejected = true;
        chunks.length = 0;
        request.destroy?.();
        reject(payloadTooLarge());
        return;
      }

      if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
        chunks.push(buffer);
      }
    });
    request.on?.('end', () => {
      if (!rejected) {
        resolve(Buffer.concat(chunks, bytes).toString('utf8'));
      }
    });
    request.on?.('error', reject);
  });
};

export const readJsonBody = async <Schema extends z.ZodTypeAny>(
  request: HttpRequest,
  schema: Schema,
  maximumBytes = REQUEST_BODY_LIMITS.default,
): Promise<z.infer<Schema>> => {
  parseContentLength(request, maximumBytes);

  if (request.body !== undefined) {
    const rawBody = request.body;
    const serialized =
      typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);

    if (
      serialized === undefined ||
      byteLength(serialized) > maximumBytes
    ) {
      throw payloadTooLarge();
    }

    let body: unknown;
    try {
      body = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    } catch {
      throw new BadRequestError({
        message: 'Request body must be valid JSON.',
      });
    }

    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestError({
        message: 'Invalid request body.',
        details: parsed.error.flatten(),
      });
    }

    return parsed.data;
  }

  const streamed = await readStreamBody(request, maximumBytes);

  try {
    const parsedJson = streamed ? JSON.parse(streamed) : {};
    const parsed = schema.safeParse(parsedJson);

    if (!parsed.success) {
      throw new BadRequestError({
        message: 'Invalid request body.',
        details: parsed.error.flatten(),
      });
    }

    return parsed.data;
  } catch (parseError) {
    if (
      parseError instanceof BadRequestError ||
      parseError instanceof PayloadTooLargeError
    ) {
      throw parseError;
    }

    throw new BadRequestError({
      message: 'Request body must be valid JSON.',
    });
  }
};
