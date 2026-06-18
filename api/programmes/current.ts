import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { GoneError } from '../../src/shared/errors/http-errors.js';

export const createGetCurrentProgrammeHandler = (
  appConfig: AppConfig = config,
) =>
  createEndpointHandler({
    allowedMethods: ['GET'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: () => {
      throw new GoneError({
        code: 'ENDPOINT_RETIRED',
        message:
          'Odin does not own finalized programme persistence. A separate approval service will provide programme reads.',
      });
    },
  });

export default async function getCurrentProgramme(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGetCurrentProgrammeHandler(config)(request, response);
}
