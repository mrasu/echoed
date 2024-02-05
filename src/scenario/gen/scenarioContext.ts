import {
  EchoedActContext,
  EchoedArrangeContext,
  EchoedAssertContext,
} from "@/scenario/gen/common/context";
import { ActResult } from "@/scenario/gen/common/type";
import { ActResultHistory, StepHistory } from "@/scenario/gen/stepHistory";

export class ScenarioContext {
  private readonly scenarioName: string;
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

  get arrangeContext(): EchoedArrangeContext {
    return {
      kind: "arrange",
      scenarioName: this.scenarioName,
      currentStepIndex: this.stepHistory.currentStepIndex,
    };
  }

  get actContext(): EchoedActContext {
    return {
      kind: "act",
      scenarioName: this.scenarioName,
      currentStepIndex: this.stepHistory.currentStepIndex,
    };
  }

  get assertContext(): EchoedAssertContext {
    return {
      kind: "assert",
      scenarioName: this.scenarioName,
      currentStepIndex: this.stepHistory.currentStepIndex,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      actResult: this.stepHistory.actResult,
    };
  }
}
