import { odinError } from '../../shared/errors/odin-errors.js';
import type { PlannerVersion } from '../../domain/programme/planner-version.js';
export {
  PlannerVersionSchema,
  type PlannerVersion,
} from '../../domain/programme/planner-version.js';

export type PlannerVersionResolution = {
  selected_version: PlannerVersion;
  requested_version: PlannerVersion | null;
  fallback_applied: boolean;
  fallback_reason: string | null;
  reason_code:
    | 'PLANNER_VERSION_DEFAULTED'
    | 'PLANNER_VERSION_REQUESTED'
    | 'PLANNER_VERSION_FALLBACK_APPLIED';
};

export const resolvePlannerVersion = (input: {
  requestedVersion?: PlannerVersion;
  defaultVersion: PlannerVersion;
  longitudinalEnabled: boolean;
  aiAgentEnabled?: boolean;
  allowedVersions: PlannerVersion[];
}): PlannerVersionResolution => {
  const requested = input.requestedVersion ?? null;
  const selected = requested ?? input.defaultVersion;
  if (!input.allowedVersions.includes(selected)) {
    throw odinError(
      'PLANNER_VERSION_UNSUPPORTED',
      'Requested planner version is not supported.',
      400,
    );
  }
  if (selected === 'ai_agent_v1' && !input.aiAgentEnabled) {
    if (requested) {
      throw odinError(
        'PLANNER_VERSION_DISABLED',
        'Requested planner version is disabled.',
        409,
      );
    }
    const fallback = input.longitudinalEnabled ? 'longitudinal_v1' : 'legacy_v1';
    if (!input.allowedVersions.includes(fallback)) {
      throw odinError(
        'PLANNER_VERSION_DISABLED',
        'Configured planner version is disabled.',
        500,
      );
    }
    return {
      selected_version: fallback,
      requested_version: null,
      fallback_applied: true,
      fallback_reason: 'PLANNER_VERSION_DISABLED',
      reason_code: 'PLANNER_VERSION_FALLBACK_APPLIED',
    };
  }
  if (selected === 'longitudinal_v1' && !input.longitudinalEnabled) {
    if (requested) {
      throw odinError(
        'PLANNER_VERSION_DISABLED',
        'Requested planner version is disabled.',
        409,
      );
    }
    if (!input.allowedVersions.includes('legacy_v1')) {
      throw odinError(
        'PLANNER_VERSION_DISABLED',
        'Configured planner version is disabled.',
        500,
      );
    }
    return {
      selected_version: 'legacy_v1',
      requested_version: null,
      fallback_applied: true,
      fallback_reason: 'PLANNER_VERSION_DISABLED',
      reason_code: 'PLANNER_VERSION_FALLBACK_APPLIED',
    };
  }
  return {
    selected_version: selected,
    requested_version: requested,
    fallback_applied: false,
    fallback_reason: null,
    reason_code: requested
      ? 'PLANNER_VERSION_REQUESTED'
      : 'PLANNER_VERSION_DEFAULTED',
  };
};
