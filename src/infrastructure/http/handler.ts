import type { AppConfig } from '../config/env.schema.js';
import type { Logger } from '../logging/logger.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  ForbiddenError,
  InternalServerError,
  MethodNotAllowedError,
} from '../../shared/errors/http-errors.js';
import { errorResponse, isSuccessResult } from './api-response.js';
import { applyCorsHeaders } from './cors.js';
import { getRequestId } from './request-id.js';
import type { HttpMethod, HttpRequest, HttpResponse } from './types.js';

export type EndpointContext = {
  requestId: string;
  config: AppConfig;
};

export type EndpointHandler<Data> = (
  request: HttpRequest,
  context: EndpointContext,
) => Promise<Data> | Data;

export type CreateEndpointHandlerOptions<Data> = {
  allowedMethods: HttpMethod[];
  config: AppConfig;
  logger: Logger;
  handle: EndpointHandler<Data>;
};

const getRequestPath = (request: HttpRequest): string => {
  if (!request.url) {
    return '';
  }

  try {
    return new URL(request.url, 'http://localhost').pathname;
  } catch {
    return request.url;
  }
};

const sendJson = (
  response: HttpResponse,
  statusCode: number,
  body: unknown,
): void => {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(body));
};

const toAppError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  return new InternalServerError({ cause: error });
};

const createAllowHeader = (allowedMethods: HttpMethod[]): string =>
  [...new Set([...allowedMethods, 'OPTIONS'])].join(', ');

export const createEndpointHandler = <Data>({
  allowedMethods,
  config,
  logger,
  handle,
}: CreateEndpointHandlerOptions<Data>) => {
  return async (
    request: HttpRequest,
    response: HttpResponse,
  ): Promise<void> => {
    const startedAt = Date.now();
    const requestId = getRequestId(request);
    const method = request.method?.toUpperCase() ?? 'GET';
    const path = getRequestPath(request);

    response.setHeader('x-request-id', requestId);

    try {
      const corsResult = applyCorsHeaders(response, request, config);

      if (!corsResult.allowed) {
        throw new ForbiddenError({
          message: 'Origin is not allowed.',
          details: null,
        });
      }

      if (method === 'OPTIONS') {
        response.statusCode = 204;
        response.setHeader('Allow', createAllowHeader(allowedMethods));
        response.end();
        logger.info('request completed', {
          requestId,
          method,
          path,
          responseStatus: 204,
          durationMs: Date.now() - startedAt,
        });
        return;
      }

      if (!allowedMethods.includes(method as HttpMethod)) {
        throw new MethodNotAllowedError({
          message: `Method ${method} is not allowed.`,
          details: {
            allow: createAllowHeader(allowedMethods),
          },
        });
      }

      const body = await handle(request, {
        requestId,
        config,
      });
      const bodyAsUnknown = body as unknown;
      const statusCode = isSuccessResult(bodyAsUnknown)
        ? (bodyAsUnknown.statusCode ?? 200)
        : 200;
      const responseBody = isSuccessResult(bodyAsUnknown)
        ? bodyAsUnknown.body
        : body;

      sendJson(response, statusCode, responseBody);
      logger.info('request completed', {
        requestId,
        method,
        path,
        responseStatus: statusCode,
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      const appError = toAppError(error);

      if (appError instanceof MethodNotAllowedError) {
        response.setHeader('Allow', createAllowHeader(allowedMethods));
      }

      const responseBody = errorResponse(
        appError.code,
        appError.message,
        appError.details,
      );

      sendJson(response, appError.httpStatus, responseBody);
      logger[appError.httpStatus >= 500 ? 'error' : 'warn']('request failed', {
        requestId,
        method,
        path,
        responseStatus: appError.httpStatus,
        durationMs: Date.now() - startedAt,
        errorCode: appError.code,
      });
    }
  };
};
