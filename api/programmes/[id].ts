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

const programmeIdFromUrl = (request: HttpRequest): string => {
  const pathname = new URL(request.url ?? '', 'http://localhost').pathname;
  const id = pathname.split('/').filter(Boolean).at(-1);

  if (!id || id === 'programmes') {
    throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
  }

  return decodeURIComponent(id);
};

export const createGetProgrammeHandler = (
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
      const saved = await repository.getById(
        user.id,
        programmeIdFromUrl(request),
      );

      if (!saved) {
        throw odinError('PROGRAMME_NOT_FOUND', 'Programme was not found.', 404);
      }

      return successResponse(programmeResponseData(saved));
    },
  });

export default async function getProgramme(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createGetProgrammeHandler(config)(request, response);
}
