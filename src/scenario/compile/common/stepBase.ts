import { Act } from "@/scenario/compile/common/act";
import { Arrange } from "@/scenario/compile/common/arrange";
import { Assert } from "@/scenario/compile/common/assert";
import { TsVariable } from "@/scenario/compile/common/tsVariable";

export abstract class StepBase {
  protected constructor(
    public readonly arranges: Arrange[],
    public readonly act: Act | undefined,
    public readonly asserts: Assert[],
    public readonly bind: Map<string, TsVariable>,
  ) {}

  boundVariables(): string[] {
    return [...this.bind.keys()];
  }

  getArrangeBoundVariablesBefore(current: number): string[] {
    const variables = new Set<string>();

    for (let i = 0; i < current && i < this.arranges.length; i++) {
      for (const variable of this.arranges[i].boundVariables()) {
        variables.add(variable);
      }
    }
    return [...variables.values()];
  }

  getArrangeBoundVariables(): string[] {
    return this.getArrangeBoundVariablesBefore(this.arranges.length);
  }
}
