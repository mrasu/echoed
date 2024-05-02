import {
  EchoedActContext,
  EchoedAssertContext,
} from "@/scenario/gen/common/context";
import { RunnerResult } from "@/scenario/gen/common/type";
import {
  ArrangeContext,
  ArrangeResult,
} from "@/scenario/gen/internal/common/arrangeContext";
import { ArrangeHistory } from "@/scenario/gen/internal/common/arrangeHistory";
import { ScenarioContext } from "@/scenario/gen/internal/common/scenarioContext";
import { ActResultHistory } from "@/scenario/gen/internal/common/stepHistory";
import { BoundVariables } from "@/scenario/gen/internal/common/type";

export type StepResult = {
  actResult: any;
  newBoundVariables: BoundVariables;
};

export class StepContext {
  public actResult: any = undefined;
  public newBoundVariables: BoundVariables = {};
  public arrangeBoundVariables: BoundVariables = {};
  private arrangeHistory = new ArrangeHistory();

  constructor(
    public readonly scenario: ScenarioContext,
    public readonly index: number,
    public readonly boundVariables: BoundVariables,
    public actResultHistory: ActResultHistory,
  ) {}

  async runArrange(fn: (_: ArrangeContext) => Promise<void>): Promise<void> {
    const arrangeCtx = this.newArrangeContext();

    await fn(arrangeCtx);

    this.arrangeFinished(arrangeCtx.result);
  }

  private newArrangeContext(): ArrangeContext {
    this.arrangeHistory.next();

    return new ArrangeContext(
      this,
      this.arrangeHistory.currentArrangeIndex,
      { ...this.arrangeBoundVariables },
      this.arrangeHistory.resultHistory,
    );
  }

  private arrangeFinished(result: ArrangeResult): void {
    this.arrangeHistory.setResult(result.runnerResult);

    this.arrangeBoundVariables = {
      ...this.arrangeBoundVariables,
      ...result.newBoundVariables,
    };
  }

  recordActResult(
    actResultHistory: ActResultHistory,
    actResult: RunnerResult,
  ): ActResultHistory {
    this.actResult = actResult;
    actResultHistory[actResultHistory.length - 1] = actResult;

    this.actResultHistory = actResultHistory;

    return this.actResultHistory;
  }

  bindNewVariable(key: string, value: any): void {
    this.newBoundVariables[key] = value;
  }

  get result(): StepResult {
    return {
      actResult: this.actResult,
      newBoundVariables: this.newBoundVariables,
    };
  }

  get echoedActContext(): EchoedActContext {
    return {
      kind: "act",
      scenarioName: this.scenario.scenarioName,
      currentStepIndex: this.index,
    };
  }

  get echoedAssertContext(): EchoedAssertContext {
    return {
      kind: "assert",
      scenarioName: this.scenario.scenarioName,
      currentStepIndex: this.index,
      actResult: this.actResult,
    };
  }
}
