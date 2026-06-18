import { config } from '../src/infrastructure/config/env.js';
import type { AppConfig } from '../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../src/infrastructure/http/handler.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../src/infrastructure/http/types.js';
import { createLogger } from '../src/infrastructure/logging/logger.js';
import { GoneError } from '../src/shared/errors/http-errors.js';

export const createProfileHandler = (appConfig: AppConfig = config) =>
  createEndpointHandler({
    allowedMethods: ['PUT'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: () => {
      throw new GoneError({
        code: 'ENDPOINT_RETIRED',
        message:
          'Odin no longer creates or updates athlete profiles. Supply transient athlete input to POST /api/odin/preview.',
      });
    },
  });

export default async function profile(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createProfileHandler(config)(request, response);
}
