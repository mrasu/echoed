import { ArrangeContext } from "@/scenario/gen/internal/jest/arrangeContext";
import { ScenarioContext } from "@/scenario/gen/internal/jest/scenarioContext";
import { StepContext } from "@/scenario/gen/internal/jest/stepContext";
import { buildStepContext } from "@/testUtil/scenario/gen/internal/jest/stepContext";

export function buildArrangeContext(
  overrides?: Partial<ArrangeContext>,
  stepOverrides?: Partial<StepContext>,
  scenarioOverrides?: Partial<ScenarioContext>,
): ArrangeContext {
  const ctx = new ArrangeContext(
    buildStepContext(stepOverrides, scenarioOverrides),
    overrides?.index ?? 0,
    overrides?.boundVariables ?? {},
    overrides?.arrangeResultHistory ?? [undefined],
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ctx.runnerResult = overrides?.runnerResult;
  ctx.newBoundVariables = overrides?.newBoundVariables ?? {};

  return ctx;
}
