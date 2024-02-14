import {
  EchoedActContext,
  EchoedAssertContext,
} from "@/scenario/gen/common/context";
import { ActResult } from "@/scenario/gen/common/type";
import { ActResultHistory, StepHistory } from "@/scenario/gen/stepHistory";

export class ScenarioContext {
  readonly scenarioName: string;
  private readonly stepHistory = new StepHistory();

  constructor(scenarioName: string) {
    this.scenarioName = scenarioName;
  }

  stepNext(): [undefined, ActResultHistory] {
    return [undefined, this.stepHistory.next()];
  }

  setActResult(actResult: ActResult): [ActResult, ActResultHistory] {
    return this.stepHistory.setActResult(actResult);
  }

  get currentStepIndex(): number {
    return this.stepHistory.currentStepIndex;
  }

  get actContext(): EchoedActContext {
    return {
      kind: "act",
      scenarioName: this.scenarioName,
      currentStepIndex: this.currentStepIndex,
    };
  }

  get assertContext(): EchoedAssertContext {
    return {
      kind: "assert",
      scenarioName: this.scenarioName,
      currentStepIndex: this.currentStepIndex,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      actResult: this.stepHistory.actResult,
    };
  }
}
