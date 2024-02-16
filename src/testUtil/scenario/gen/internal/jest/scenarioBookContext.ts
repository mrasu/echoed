import { ScenarioBookContext } from "@/scenario/gen/internal/jest";
import { BoundVariables } from "@/scenario/gen/internal/jest/type";

export function buildScenarioBookContext(overrides?: {
  hookBoundVariables?: {
    beforeAll?: Record<string, unknown>;
    afterAll?: Record<string, unknown>;
    beforeEach?: Record<string, unknown>;
    afterEach?: Record<string, unknown>;
  };
  defaultRunnerOptions?: Record<string, BoundVariables>;
  defaultAssertOptions?: Record<string, BoundVariables>;
}): ScenarioBookContext {
  const ctx = new ScenarioBookContext();

  ctx.hookBoundVariables = {
    beforeAll: overrides?.hookBoundVariables?.beforeAll ?? {},
    afterAll: overrides?.hookBoundVariables?.afterAll ?? {},
    beforeEach: overrides?.hookBoundVariables?.beforeEach ?? {},
    afterEach: overrides?.hookBoundVariables?.afterEach ?? {},
  };

  if (overrides?.defaultRunnerOptions) {
    ctx.setDefaultRunnerOption(overrides.defaultRunnerOptions);
  }

  if (overrides?.defaultAssertOptions) {
    ctx.setDefaultAsserterOption(overrides.defaultAssertOptions);
  }

  return ctx;
}
