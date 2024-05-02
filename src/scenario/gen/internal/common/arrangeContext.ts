import { EchoedArrangeContext } from "@/scenario/gen/common/context";
import { RunnerResult } from "@/scenario/gen/common/type";
import { ArrangeResultHistory } from "@/scenario/gen/internal/common/arrangeHistory";
import { StepContext } from "@/scenario/gen/internal/common/stepContext";
import { BoundVariables } from "@/scenario/gen/internal/common/type";

export type ArrangeResult = {
  runnerResult: any;
  newBoundVariables: BoundVariables;
};

export class ArrangeContext {
  public runnerResult: any = undefined;
  public newBoundVariables: BoundVariables = {};

  constructor(
    private readonly step: StepContext,
    public readonly index: number,
    public boundVariables: BoundVariables,
    public readonly arrangeResultHistory: ArrangeResultHistory,
  ) {}

  recordRunnerResult(arrangeResult: RunnerResult): ArrangeResultHistory {
    this.runnerResult = arrangeResult;
    this.arrangeResultHistory[this.arrangeResultHistory.length - 1] =
      arrangeResult;

    return this.arrangeResultHistory;
  }

  bindNewVariable(key: string, value: any): void {
    this.newBoundVariables[key] = value;
  }

  get result(): ArrangeResult {
    return {
      runnerResult: this.runnerResult,
      newBoundVariables: this.newBoundVariables,
    };
  }

  get echoedArrangeContext(): EchoedArrangeContext {
    return {
      kind: "arrange",
      scenarioName: this.step.scenario.scenarioName,
      currentStepIndex: this.step.index,
      currentArrangeIndex: this.index,
    };
  }
}
