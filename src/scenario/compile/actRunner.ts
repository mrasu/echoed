import { RunnerContainer } from "@/scenario/compile/runnerContainer";

export class ActRunner extends RunnerContainer {
  constructor(container: RunnerContainer) {
    super(container.name, container.argument, container.option);
  }
}
