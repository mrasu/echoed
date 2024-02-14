import { RunnerContainer } from "@/scenario/compile/runnerContainer";
import { TsVariable } from "@/scenario/compile/tsVariable";

export class ArrangeRunner extends RunnerContainer {
  constructor(
    container: RunnerContainer,
    public readonly bind: Map<string, TsVariable>,
  ) {
    super(container.name, container.argument, container.option);
  }

  boundVariables(): IterableIterator<string> {
    return this.bind.keys();
  }
}
