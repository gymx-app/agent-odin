import type { PhaseTemplate } from './phase.types.js';

export const allocatePhaseLengths = (
  totalWeeks: number,
  templates: PhaseTemplate[],
): number[] => {
  let selected = [...templates];
  while (
    selected.length > 1 &&
    selected.reduce((sum, phase) => sum + phase.minimum_weeks, 0) > totalWeeks
  ) {
    const removable = selected.findIndex(
      (phase, index) =>
        index > 0 &&
        index < selected.length - 1 &&
        phase.phase_type !== 'foundation',
    );
    selected.splice(removable >= 0 ? removable : selected.length - 1, 1);
  }

  const lengths = selected.map((phase) => phase.minimum_weeks);
  let remaining = totalWeeks - lengths.reduce((sum, value) => sum + value, 0);
  const order = selected
    .map((phase, index) => ({ index, weight: phase.weight }))
    .sort(
      (left, right) => right.weight - left.weight || left.index - right.index,
    );

  while (remaining > 0) {
    order.forEach(({ index }) => {
      if (remaining > 0) {
        lengths[index]! += 1;
        remaining -= 1;
      }
    });
  }

  templates.splice(0, templates.length, ...selected);
  return lengths;
};
