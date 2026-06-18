import { z } from 'zod';
import type { HttpRequest } from './types.js';
import { BadRequestError } from '../../shared/errors/http-errors.js';

const readStreamBody = async (request: HttpRequest): Promise<string> => {
  if (!request.on) {
    return '';
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on?.('data', (chunk) => {
      if (typeof chunk === 'string' || Buffer.isBuffer(chunk)) {
        chunks.push(Buffer.from(chunk));
      }
    });
    request.on?.('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on?.('error', reject);
  });
};

export const readJsonBody = async <Schema extends z.ZodTypeAny>(
  request: HttpRequest,
  schema: Schema,
): Promise<z.infer<Schema>> => {
  const rawBody =
    request.body ??
    (() => {
      throw new Error('stream');
    })();

  try {
    const body =
      rawBody === undefined
        ? undefined
        : typeof rawBody === 'string'
          ? JSON.parse(rawBody)
          : rawBody;
    const parsed = schema.safeParse(body ?? {});

    if (!parsed.success) {
      throw new BadRequestError({
        message: 'Invalid request body.',
        details: parsed.error.flatten(),
      });
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    const streamed = await readStreamBody(request);

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
      if (parseError instanceof BadRequestError) {
        throw parseError;
      }

      throw new BadRequestError({
        message: 'Request body must be valid JSON.',
      });
    }
  }
};
