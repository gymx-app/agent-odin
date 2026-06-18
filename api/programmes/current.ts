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
import { odinError } from '../../src/shared/errors/odin-errors.js';
import {
  createApiDependencies,
  type ApiDependencies,
} from '../../src/api/dependencies.js';
import { ProgrammeRepository } from '../../src/repositories/programme.repository.js';
import { programmeResponseData } from '../../src/application/programme-response.js';

export const createGetCurrentProgrammeHandler = (
  appConfig: AppConfig = config,
  dependencies: ApiDependencies = createApiDependencies(appConfig),
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
      const repository = new ProgrammeRepository(dependencies.adminClient);
      const saved = await repository.getCurrentDraft(user.id);

      if (!saved) {
        throw odinError(
          'CURRENT_PROGRAMME_NOT_FOUND',
          'Current draft programme was not found.',
          404,
        );
      }

      return successResponse(programmeResponseData(saved));
    },
  });

export default async function getCurrentProgramme(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGetCurrentProgrammeHandler(config)(request, response);
}
