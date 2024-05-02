import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

export class ArrangeRunner extends RunnerContainer {
  constructor(
    container: RunnerContainer,
    public readonly bind: Map<string, TsVariable>,
  ) {
    super(container.name, container.argument, container.option);
  }

  boundVariables(): string[] {
    return [...this.bind.keys()];
  }
}
