import {
  ArrangeHistory,
  ArrangeResultHistory,
} from "@/scenario/gen/arrangeHistory";
import { EchoedArrangeContext } from "@/scenario/gen/common/context";
import { RunnerResult } from "@/scenario/gen/common/type";
import { ScenarioContext } from "@/scenario/gen/scenarioContext";

export class ArrangeContext {
  private readonly scenarioContext: ScenarioContext;
  private arrangeResultHistory = new ArrangeHistory();

  static start(
    scenarioContext: ScenarioContext,
  ): [undefined, ArrangeResultHistory, ArrangeContext] {
    const ctx = new ArrangeContext(scenarioContext);
    return [undefined, ctx.arrangeResultHistory.restart(), ctx];
  }

  constructor(scenarioContext: ScenarioContext) {
    this.scenarioContext = scenarioContext;
  }

  next(): [RunnerResult, ArrangeResultHistory] {
    return [undefined, this.arrangeResultHistory.next()];
  }

  setResult(arrangeResult: RunnerResult): [RunnerResult, ArrangeResultHistory] {
    return this.arrangeResultHistory.setResult(arrangeResult);
  }

  get context(): EchoedArrangeContext {
    return {
      kind: "arrange",
      scenarioName: this.scenarioContext.scenarioName,
      currentStepIndex: this.scenarioContext.currentStepIndex,
      currentArrangeIndex: this.arrangeResultHistory.currentArrangeIndex,
    };
  }
}
