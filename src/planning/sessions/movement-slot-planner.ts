import type {
  MovementPattern,
  MuscleGroup,
} from '../../domain/exercise/exercise-taxonomy.js';
import type {
  MovementSlotV2,
  ResistanceSessionBuilderInput,
  SessionKind,
} from './session.types.js';

type SlotTemplate = {
  pattern: MovementPattern;
  substitutions: MovementPattern[];
  muscles: MuscleGroup[];
  role: MovementSlotV2['sequence_role'];
  required: boolean;
};

const templates: Record<SessionKind, SlotTemplate[]> = {
  full_body: [
    {
      pattern: 'squat',
      substitutions: ['knee_extension_isolation'],
      muscles: ['quadriceps', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'hinge',
      substitutions: ['knee_flexion_isolation'],
      muscles: ['hamstrings', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'horizontal_push',
      substitutions: ['vertical_push'],
      muscles: ['chest', 'triceps'],
      role: 'secondary',
      required: true,
    },
    {
      pattern: 'horizontal_pull',
      substitutions: ['vertical_pull'],
      muscles: ['upper_back', 'lats'],
      role: 'secondary',
      required: true,
    },
    {
      pattern: 'core_anti_extension',
      substitutions: ['core_anti_rotation', 'carry'],
      muscles: ['abdominals'],
      role: 'core',
      required: false,
    },
  ],
  upper: [
    {
      pattern: 'horizontal_push',
      substitutions: [],
      muscles: ['chest', 'triceps'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'horizontal_pull',
      substitutions: [],
      muscles: ['upper_back', 'lats'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'vertical_push',
      substitutions: ['shoulder_abduction'],
      muscles: ['front_delts', 'triceps'],
      role: 'secondary',
      required: false,
    },
    {
      pattern: 'vertical_pull',
      substitutions: [],
      muscles: ['lats', 'biceps'],
      role: 'secondary',
      required: false,
    },
    {
      pattern: 'elbow_flexion',
      substitutions: ['shoulder_abduction'],
      muscles: ['biceps', 'side_delts'],
      role: 'isolation',
      required: false,
    },
  ],
  lower: [
    {
      pattern: 'squat',
      substitutions: ['knee_extension_isolation'],
      muscles: ['quadriceps', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'hinge',
      substitutions: ['knee_flexion_isolation'],
      muscles: ['hamstrings', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'knee_flexion_isolation',
      substitutions: [],
      muscles: ['hamstrings'],
      role: 'isolation',
      required: false,
    },
    {
      pattern: 'calf_raise',
      substitutions: ['core_anti_rotation'],
      muscles: ['calves', 'obliques'],
      role: 'accessory',
      required: false,
    },
  ],
  push: [
    {
      pattern: 'horizontal_push',
      substitutions: [],
      muscles: ['chest', 'triceps'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'vertical_push',
      substitutions: ['shoulder_abduction'],
      muscles: ['front_delts', 'triceps'],
      role: 'secondary',
      required: true,
    },
    {
      pattern: 'elbow_extension',
      substitutions: [],
      muscles: ['triceps'],
      role: 'isolation',
      required: false,
    },
  ],
  pull: [
    {
      pattern: 'vertical_pull',
      substitutions: [],
      muscles: ['lats', 'biceps'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'horizontal_pull',
      substitutions: [],
      muscles: ['upper_back', 'lats'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'elbow_flexion',
      substitutions: ['shoulder_abduction'],
      muscles: ['biceps', 'rear_delts'],
      role: 'isolation',
      required: false,
    },
  ],
  legs: [
    {
      pattern: 'squat',
      substitutions: ['knee_extension_isolation'],
      muscles: ['quadriceps', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'hinge',
      substitutions: ['knee_flexion_isolation'],
      muscles: ['hamstrings', 'glutes'],
      role: 'primary',
      required: true,
    },
    {
      pattern: 'knee_flexion_isolation',
      substitutions: [],
      muscles: ['hamstrings'],
      role: 'isolation',
      required: false,
    },
    {
      pattern: 'calf_raise',
      substitutions: [],
      muscles: ['calves'],
      role: 'accessory',
      required: false,
    },
  ],
  specialized: [],
  sport_support: [
    {
      pattern: 'horizontal_push',
      substitutions: ['vertical_push'],
      muscles: ['chest', 'triceps'],
      role: 'secondary',
      required: true,
    },
    {
      pattern: 'horizontal_pull',
      substitutions: ['vertical_pull'],
      muscles: ['upper_back', 'lats'],
      role: 'secondary',
      required: true,
    },
    {
      pattern: 'hinge',
      substitutions: ['knee_flexion_isolation'],
      muscles: ['hamstrings', 'glutes'],
      role: 'primary',
      required: false,
    },
  ],
};

const excludedBudget = (
  budget: ResistanceSessionBuilderInput['session_budget'],
  pattern: MovementPattern,
): boolean =>
  pattern in budget.movement_pattern_budgets &&
  budget.movement_pattern_budgets[pattern] === 0;

const repZone = (
  input: ResistanceSessionBuilderInput,
  role: MovementSlotV2['sequence_role'],
): { min: number; max: number } => {
  if (input.strategy.primary_objective === 'strength' && role === 'primary') {
    return { min: 3, max: 6 };
  }
  if (role === 'isolation' || role === 'accessory' || role === 'core') {
    return { min: 10, max: 20 };
  }
  return input.strategy.primary_objective === 'muscle_gain'
    ? { min: 6, max: 12 }
    : { min: 6, max: 10 };
};

export const planMovementSlotsV2 = (
  input: ResistanceSessionBuilderInput,
  sessionKind: SessionKind,
): { slots: MovementSlotV2[]; rationale_codes: string[] } => {
  const available = templates[sessionKind].filter(
    (template) =>
      !excludedBudget(input.session_budget, template.pattern) ||
      template.substitutions.some(
        (pattern) => !excludedBudget(input.session_budget, pattern),
      ),
  );
  const setBudget = input.session_budget.total_working_set_budget;
  const minimumRequired = available.filter((slot) => slot.required).length;
  if (setBudget < minimumRequired) {
    return {
      slots: [],
      rationale_codes: ['SESSION_MOVEMENT_COVERAGE_IMPOSSIBLE'],
    };
  }
  let remaining = setBudget;
  const slots = available
    .map((template, index) => {
      const minimum = template.required ? 1 : 0;
      const desired =
        template.role === 'primary' ? 3 : template.role === 'secondary' ? 2 : 1;
      const set_budget = Math.min(
        desired,
        Math.max(minimum, remaining - (minimumRequired - index - 1)),
      );
      remaining -= set_budget;
      return {
        slot_id: `${sessionKind}-${template.pattern}-${index + 1}`,
        movement_pattern: template.pattern,
        allowed_substitution_patterns: template.substitutions,
        target_muscle_groups: template.muscles,
        sequence_role: template.role,
        priority: index + 1,
        required: template.required,
        set_budget,
        rep_zone: repZone(input, template.role),
        target_rpe: input.session_budget.effort_target,
        rpe_ceiling: input.session_budget.rpe_ceiling,
        fatigue_budget: {
          systemic: input.session_budget.fatigue_ceiling,
          local: input.session_budget.fatigue_ceiling,
          grip: input.week.planning_metadata.fatigue_budget.grip_target,
          lower_back:
            input.week.planning_metadata.fatigue_budget.lower_back_target,
        },
        progression_policy_id: 'default-progression',
      } satisfies MovementSlotV2;
    })
    .filter((slot) => slot.set_budget > 0);

  let cursor = 0;
  while (remaining > 0 && slots.length > 0) {
    slots[cursor % slots.length]!.set_budget += 1;
    remaining -= 1;
    cursor += 1;
  }

  return {
    slots,
    rationale_codes: slots.flatMap((slot) => [
      slot.sequence_role === 'primary'
        ? 'PRIMARY_MOVEMENT_SLOT_CREATED'
        : 'MUSCLE_PRIORITY_SLOT_CREATED',
    ]),
  };
};
