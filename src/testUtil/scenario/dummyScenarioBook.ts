import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { ScenarioBookBase } from "@/scenario/compile/common/scenarioBookBase";
import { ScenarioRunnerConfig } from "@/scenario/compile/common/scenarioRunnerConfig";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { DummyStep } from "@/testUtil/scenario/dummyStep";

const defaultScenarioBookVals = {
  scenarios: [] as ScenarioBase<DummyStep>[],
  runnerOptions: [] as ScenarioRunnerConfig[],
  variables: new Map<string, TsVariable>(),
  retry: undefined as number | undefined,
};

export class DummyScenarioBookBase extends ScenarioBookBase<
  ScenarioBase<DummyStep>
> {
  constructor(values: Partial<typeof defaultScenarioBookVals> = {}) {
    const vals = { ...defaultScenarioBookVals, ...values };
    super(vals.scenarios, vals.runnerOptions, vals.variables, vals.retry);
  }
}
