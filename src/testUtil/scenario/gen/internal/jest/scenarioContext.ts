import { ScenarioContext } from "@/scenario/gen/internal/jest/scenarioContext";

export function buildScenarioContext(
  overrides?: Partial<ScenarioContext>,
): ScenarioContext {
  return new ScenarioContext(overrides?.scenarioName ?? "test scenario name");
}
