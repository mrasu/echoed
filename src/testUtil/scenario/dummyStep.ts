import { Act } from "@/scenario/compile/common/act";
import { Arrange } from "@/scenario/compile/common/arrange";
import { Assert } from "@/scenario/compile/common/assert";
import { StepBase } from "@/scenario/compile/common/stepBase";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

const defaultStepVals = {
  arranges: [] as Arrange[],
  act: undefined as Act | undefined,
  asserts: [] as Assert[],
  bind: new Map<string, TsVariable>(),
};

export class DummyStep extends StepBase {
  constructor(values: Partial<typeof defaultStepVals> = {}) {
    const vals = { ...defaultStepVals, ...values };

    super(vals.arranges, vals.act, vals.asserts, vals.bind);
  }
}
