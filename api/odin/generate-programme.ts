import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { odinError } from '../../src/shared/errors/odin-errors.js';
import type { HttpRequest, HttpResponse } from '../../src/infrastructure/http/types.js';

const V2_MIGRATION_PATH = '/api/v2/odin/generate-programme';

// v1 is deprecated — kept registered (410, not 404) so existing clients get
// an explicit, actionable error instead of a silent route-not-found.
// All active generation traffic goes through generate-programme-v2.ts.
export const createGenerateProgrammeHandler = (appConfig: AppConfig = config) =>
  createEndpointHandler({
    allowedMethods: ['POST'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: () => {
      throw odinError(
        'ENDPOINT_DEPRECATED',
        'This endpoint has been deprecated. Use /api/v2/odin/generate-programme instead.',
        410,
        { migration: V2_MIGRATION_PATH },
      );
    },
  });

export default async function generateProgramme(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGenerateProgrammeHandler(config)(request, response);
}
