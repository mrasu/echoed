import { RunnerContainer } from "@/scenario/compile/common/runnerContainer";

export class ActRunner extends RunnerContainer {
  constructor(container: RunnerContainer) {
    super(container.name, container.argument, container.option);
  }
}
