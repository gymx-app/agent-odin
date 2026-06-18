import type { AppConfig } from '../infrastructure/config/env.schema.js';
import { createSupabaseAdminClient } from '../infrastructure/supabase/admin-client.js';
import { createSupabaseAuthClient } from '../infrastructure/supabase/auth-client.js';
import type {
  SupabaseAuthClientLike,
  SupabaseClientLike,
} from '../infrastructure/supabase/supabase.types.js';
import { AthleteProfileRepository } from '../repositories/athlete-profile.repository.js';
import { ExerciseLibraryRepository } from '../repositories/exercise-library.repository.js';
import { ProgrammeRepository } from '../repositories/programme.repository.js';
import { AgentRunRepository } from '../repositories/agent-run.repository.js';
import { IdempotencyRepository } from '../repositories/idempotency.repository.js';
import { createOpenAIClient } from '../llm/openai-client.js';
import { OpenAIProgrammeRefinementProvider } from '../llm/openai-programme-refinement-provider.js';
import type { ProgrammeRefinementProvider } from '../llm/programme-refinement-provider.js';

export type ApiDependencies = {
  authClient: SupabaseAuthClientLike;
  adminClient: SupabaseClientLike;
  refinementProvider?: ProgrammeRefinementProvider;
};

export const createApiDependencies = (config: AppConfig): ApiDependencies => {
  const dependencies: ApiDependencies = {
    authClient: createSupabaseAuthClient(config),
    adminClient: createSupabaseAdminClient(config),
  };

  if (config.llmRefinementEnabled) {
    dependencies.refinementProvider = new OpenAIProgrammeRefinementProvider(
      createOpenAIClient(config),
      config,
    );
  }

  return dependencies;
};

export const createRepositories = (adminClient: SupabaseClientLike) => ({
  athleteProfiles: new AthleteProfileRepository(adminClient),
  exercises: new ExerciseLibraryRepository(adminClient),
  programmes: new ProgrammeRepository(adminClient),
  agentRuns: new AgentRunRepository(adminClient),
  idempotency: new IdempotencyRepository(adminClient),
});
