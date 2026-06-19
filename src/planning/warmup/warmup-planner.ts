import { buildWarmupComponents } from './warmup-component-builder.js';
import { planRampUpSets } from './ramp-up-set-planner.js';
import {
  estimateWarmupItemSeconds,
  type PlannedWarmup,
  type WarmupItem,
  type WarmupPlannerInput,
} from './warmup.types.js';

const duration = (items: WarmupItem[]): number =>
  items.reduce((sum, item) => sum + estimateWarmupItemSeconds(item), 0);

const normalizeOrder = (items: WarmupItem[]): WarmupItem[] =>
  items.map((item, index) => ({ ...item, display_order: index + 1 }));

export const planSessionWarmup = (input: WarmupPlannerInput): PlannedWarmup => {
  const components = buildWarmupComponents(input);
  const ramps = planRampUpSets(input, components.length + 1);
  let items = normalizeOrder([...components, ...ramps]);
  let compressed = false;
  const maximumSeconds =
    input.profile.source.session_duration_min <= 30 ? 360 : 900;

  if (duration(items) > maximumSeconds) {
    compressed = true;
    items = items.filter(
      (candidate) =>
        !['activation', 'targeted_mobility'].includes(
          candidate.component_type,
        ) ||
        candidate.rationale_codes.includes(
          'CLINICIAN_MOBILITY_REQUIREMENT_APPLIED',
        ),
    );
    const pulse = items.find(
      (candidate) => candidate.component_type === 'pulse_raiser',
    );
    if (pulse?.duration_seconds && pulse.duration_seconds > 60) {
      pulse.duration_seconds = 60;
      pulse.rationale_codes = [
        ...pulse.rationale_codes,
        'PULSE_RAISER_SHORTENED_FOR_DURATION',
      ];
    }
    items = normalizeOrder(items);
  }

  const rationale = items.flatMap((candidate) => candidate.rationale_codes);
  if (compressed) rationale.push('WARMUP_COMPRESSED_FOR_SESSION_LIMIT');

  return {
    items,
    duration_seconds: duration(items),
    rationale_codes: [...new Set(rationale)],
    compressed_for_duration: compressed,
  };
};
