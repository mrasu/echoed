import {
  StepContext,
  StepResult,
} from "@/scenario/gen/internal/jest/stepContext";
import { StepHistory } from "@/scenario/gen/internal/jest/stepHistory";
import { BoundVariables } from "@/scenario/gen/internal/jest/type";

export class ScenarioContext {
  readonly scenarioName: string;
  private readonly stepHistory = new StepHistory();
  private boundVariables: BoundVariables = {};

  constructor(scenarioName: string) {
    this.scenarioName = scenarioName;
  }

  async runStep(fn: (_: StepContext) => Promise<void>): Promise<void> {
    const arrangeCtx = this.newStepContext();

    await fn(arrangeCtx);

    this.stepFinished(arrangeCtx.result);
  }

  private newStepContext(): StepContext {
    this.stepHistory.next();
    return new StepContext(
      this,
      this.stepHistory.currentStepIndex,
      { ...this.boundVariables },
      this.stepHistory.actResultHistory,
    );
  }

  private stepFinished(step: StepResult): void {
    this.stepHistory.setActResult(step.actResult);

    this.boundVariables = { ...this.boundVariables, ...step.newBoundVariables };
  }
}
