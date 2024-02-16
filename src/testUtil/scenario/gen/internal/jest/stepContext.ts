import { ScenarioContext } from "@/scenario/gen/internal/jest/scenarioContext";
import { StepContext } from "@/scenario/gen/internal/jest/stepContext";
import { buildScenarioContext } from "@/testUtil/scenario/gen/internal/jest/scenarioContext";

export function buildStepContext(
  overrides?: Partial<StepContext>,
  scenarioOverrides?: Partial<ScenarioContext>,
): StepContext {
  return new StepContext(
    buildScenarioContext(scenarioOverrides),
    overrides?.index ?? 0,
    overrides?.boundVariables ?? {},
    overrides?.actResultHistory ?? [undefined],
  );
}
