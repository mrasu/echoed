import { ScenarioContext } from "@/scenario/gen/internal/common/scenarioContext";

export function buildScenarioContext(
  overrides?: Partial<ScenarioContext>,
): ScenarioContext {
  return new ScenarioContext(overrides?.scenarioName ?? "test scenario name");
}
