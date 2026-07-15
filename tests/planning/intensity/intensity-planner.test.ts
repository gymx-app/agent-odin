import { describe, expect, it } from 'vitest';
import { undulatingDayRoleForIndex } from '../../../src/planning/intensity/intensity-planner.js';

describe('undulatingDayRoleForIndex', () => {
  it('cycles heavy -> moderate -> light', () => {
    expect(undulatingDayRoleForIndex(0)).toBe('heavy');
    expect(undulatingDayRoleForIndex(1)).toBe('moderate');
    expect(undulatingDayRoleForIndex(2)).toBe('light');
  });

  it('wraps back to heavy after light', () => {
    expect(undulatingDayRoleForIndex(3)).toBe('heavy');
    expect(undulatingDayRoleForIndex(4)).toBe('moderate');
  });

  it('is deterministic', () => {
    expect(undulatingDayRoleForIndex(7)).toBe(undulatingDayRoleForIndex(7));
  });
});
