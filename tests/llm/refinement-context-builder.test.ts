import { describe, expect, it } from 'vitest';
import { buildRefinementContext } from '../../src/llm/refinement-context-builder.js';
import { refinementFixture } from './test-refinement.js';

describe('buildRefinementContext', () => {
  it('includes planning constraints and exact prescriptions without identity data', () => {
    const fixture = refinementFixture();
    const first = buildRefinementContext(
      fixture.profile,
      fixture.programme,
      fixture.validation,
      fixture.exercises,
    );
    const second = buildRefinementContext(
      fixture.profile,
      fixture.programme,
      fixture.validation,
      fixture.exercises,
    );
    const serialized = JSON.stringify(first);

    expect(first).toStrictEqual(second);
    expect(first.athlete.age_band).toBeTruthy();
    expect(first.athlete.movement_restrictions).toEqual(
      fixture.profile.movement_restrictions,
    );
    expect(first.baseline.validation).toStrictEqual(fixture.validation);
    expect(serialized).not.toContain('user_id');
    expect(serialized).not.toContain('accessToken');
    expect(serialized).not.toContain('email');
    expect(serialized).toContain('target_reps');
  });

  it('limits alternatives to the current exercise plus five eligible options', () => {
    const fixture = refinementFixture();
    const context = buildRefinementContext(
      fixture.profile,
      fixture.programme,
      fixture.validation,
      fixture.exercises,
    );

    context.exercise_alternatives.forEach((entry) => {
      expect(entry.options.length).toBeLessThanOrEqual(6);
      expect(entry.options[0]!.exercise_id).toBe(entry.exercise_id);
    });
  });
});
