import { ActResult } from "@/scenario/gen/common/type";
import { buildRelativeIndexableArray } from "@/util/proxy";

type StepContent = {
  actResult: ActResult;
};

export type ActResultHistory = ActResult[];

export class StepHistory {
  private readonly stepContents: StepContent[] = [];

  get currentStepIndex(): number {
    return this.stepContents.length - 1;
  }

  get actResult(): ActResult {
    if (this.currentStepIndex === -1) {
      return undefined;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.stepContents[this.currentStepIndex].actResult;
  }

  next(): ActResultHistory {
    this.stepContents.push({
      actResult: undefined,
    });

    return this.buildActResultHistoryProxy();
  }

  setActResult(response: ActResult): [ActResult, ActResultHistory] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.stepContents[this.currentStepIndex].actResult = response;
    return [response, this.buildActResultHistoryProxy()];
  }

  private buildActResultHistoryProxy(): ActResultHistory {
    const copy = this.stepContents.map((c): ActResult => c.actResult);

    return buildRelativeIndexableArray(copy) as ActResultHistory;
  }
}
