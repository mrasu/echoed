import { RunnerResult } from "@/scenario/gen/common/type";
import { ActResultHistory } from "@/scenario/gen/internal/jest/stepHistory";
import { buildRelativeIndexableArray } from "@/util/proxy";

export type ArrangeResultHistory = RunnerResult[];

export class ArrangeHistory {
  private results: ArrangeResultHistory = [];

  get currentArrangeIndex(): number {
    return this.results.length - 1;
  }

  next(): ArrangeResultHistory {
    this.results.push(undefined);

    return this.buildArrangeResultHistoryProxy();
  }

  get resultHistory(): ArrangeResultHistory {
    return this.buildArrangeResultHistoryProxy();
  }

  setResult(response: RunnerResult): [RunnerResult, ActResultHistory] {
    this.results[this.currentArrangeIndex] = response;
    return [response, this.buildArrangeResultHistoryProxy()];
  }

  private buildArrangeResultHistoryProxy(): ArrangeResultHistory {
    return buildRelativeIndexableArray(this.results) as ArrangeResultHistory;
  }
}
