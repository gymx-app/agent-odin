import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { GoneError } from '../../src/shared/errors/http-errors.js';

export const createGenerateHandler = (appConfig: AppConfig = config) =>
  createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: () => {
      throw new GoneError({
        code: 'ENDPOINT_RETIRED',
        message:
          'Persistent generation is retired. Use POST /api/odin/preview for a stateless programme preview.',
      });
    },
  });

export default async function generate(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGenerateHandler(config)(request, response);
}
