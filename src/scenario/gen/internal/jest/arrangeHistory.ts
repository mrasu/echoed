import { RunnerResult } from "@/scenario/gen/common/type";
import { ActResultHistory } from "@/scenario/gen/internal/jest/stepHistory";
import { buildRelativeIndexableArray } from "@/util/proxy";

export type ArrangeResultHistory = RunnerResult[];

export class ArrangeHistory {
  private results: ArrangeResultHistory = [];

  get currentArrangeIndex(): number {
    return this.results.length - 1;
  }

  restart(): ArrangeResultHistory {
    this.results = [];
    return this.buildArrangeResultHistoryProxy();
  }

  next(): ArrangeResultHistory {
    this.results.push(undefined);

    return this.buildArrangeResultHistoryProxy();
  }

  setResult(response: RunnerResult): [RunnerResult, ActResultHistory] {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.results[this.currentArrangeIndex] = response;
    return [response, this.buildArrangeResultHistoryProxy()];
  }

  private buildArrangeResultHistoryProxy(): ArrangeResultHistory {
    return buildRelativeIndexableArray(this.results) as ArrangeResultHistory;
  }
}
