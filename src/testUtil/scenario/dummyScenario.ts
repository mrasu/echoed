import { ScenarioBase } from "@/scenario/compile/common/scenarioBase";
import { DummyStep } from "@/testUtil/scenario/dummyStep";

const defaultScenarioVals = {
  name: "dummy",
  steps: [] as DummyStep[],
};

export class DummyScenario extends ScenarioBase<DummyStep> {
  constructor(values: Partial<typeof defaultScenarioVals> = {}) {
    const vals = { ...defaultScenarioVals, ...values };
    super(vals.name, vals.steps);
  }
}
