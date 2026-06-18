import { config } from '../src/infrastructure/config/env.js';
import type { AppConfig } from '../src/infrastructure/config/env.schema.js';
import { createEndpointHandler } from '../src/infrastructure/http/handler.js';
import { readJsonBody } from '../src/infrastructure/http/request-body.js';
import type {
  HttpRequest,
  HttpResponse,
} from '../src/infrastructure/http/types.js';
import { successResponse } from '../src/infrastructure/http/api-response.js';
import { createLogger } from '../src/infrastructure/logging/logger.js';
import { requireAuthenticatedUser } from '../src/infrastructure/supabase/auth.js';
import { AthleteInputSchema } from '../src/domain/athlete/athlete-input.schema.js';
import {
  getRuntimeDependencies,
  type ApiDependencies,
} from '../src/api/dependencies.js';
import { AthleteProfileRepository } from '../src/repositories/athlete-profile.repository.js';
import { REQUEST_BODY_LIMITS } from '../src/infrastructure/http/request-limits.js';
import { upsertAthleteProfile } from '../src/application/profiles/upsert-athlete-profile.js';

export const createProfileHandler = (
  appConfig: AppConfig = config,
  dependencies: ApiDependencies = getRuntimeDependencies(appConfig),
) =>
  createEndpointHandler({
    allowedMethods: ['PUT'],
    config: appConfig,
    logger: createLogger(appConfig),
    handle: async (request) => {
      const user = await requireAuthenticatedUser(
        request,
        dependencies.authClient,
      );
      const body = await readJsonBody(
        request,
        AthleteInputSchema,
        REQUEST_BODY_LIMITS.profile,
      );
      const repository = new AthleteProfileRepository(dependencies.adminClient);
      const athlete = await upsertAthleteProfile(user.id, body, repository);

      return successResponse({ profile: athlete });
    },
  });

export default async function profile(
  request: HttpRequest,
  response: HttpResponse,
): Promise<void> {
  await createProfileHandler(config)(request, response);
}
