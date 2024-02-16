import { RunnerResult } from "@/scenario/gen/common/type";
import { buildRelativeIndexableArray } from "@/util/proxy";

type StepContent = {
  actResult: RunnerResult;
};

export type ActResultHistory = RunnerResult[];

export class StepHistory {
  private readonly stepContents: StepContent[] = [];

  get currentStepIndex(): number {
    return this.stepContents.length - 1;
  }

  next(): void {
    this.stepContents.push({
      actResult: undefined,
    });
  }

  get actResultHistory(): ActResultHistory {
    return this.buildActResultHistoryProxy();
  }

  setActResult(response: RunnerResult): void {
    this.stepContents[this.currentStepIndex].actResult = response;
  }

  private buildActResultHistoryProxy(): ActResultHistory {
    const copy = this.stepContents.map((c): RunnerResult => c.actResult);

    return buildRelativeIndexableArray(copy) as ActResultHistory;
  }
}
