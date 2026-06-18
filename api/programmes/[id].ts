import { config } from '../../src/infrastructure/config/env.js';
import type { AppConfig } from '../../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../../src/infrastructure/http/handler.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../../src/infrastructure/http/types.js';
import { successResponse } from '../../src/infrastructure/http/api-response.js';
import { createLogger } from '../../src/infrastructure/logging/logger.js';
import { requireAuthenticatedUser } from '../../src/infrastructure/supabase/auth.js';
import {
  getRuntimeDependencies,
  createRepositories,
  type ApiDependencies,
} from '../../src/api/dependencies.js';
import { programmeResponseData } from '../../src/application/programme-response.js';
import { programmeIdFromRequest } from '../../src/infrastructure/http/route-params.js';
import { getProgrammeById } from '../../src/application/programmes/get-programme-by-id.js';

export const createGetProgrammeHandler = (
  appConfig: AppConfig = config,
  dependencies: ApiDependencies = getRuntimeDependencies(appConfig),
) =>
  createEndpointHandler({
    allowedMethods: ['GET'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      const user = await requireAuthenticatedUser(
        request,
        dependencies.authClient,
      );
      const repository = createRepositories(
        dependencies.adminClient,
      ).programmes;
      const saved = await getProgrammeById(
        user.id,
        programmeIdFromRequest(request),
        repository,
      );

      return successResponse(programmeResponseData(saved));
    },
  });

export default async function getProgramme(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGetProgrammeHandler(config)(request, response);
}
