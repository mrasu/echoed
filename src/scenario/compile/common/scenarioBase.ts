import { StepBase } from "@/scenario/compile/common/stepBase";
import { escapeTemplateString } from "@/scenario/compile/common/util";

export abstract class ScenarioBase<T extends StepBase> {
  protected constructor(
    public readonly name: string,
    public readonly steps: T[],
  ) {}

  getBoundVariablesBefore(index: number): string[] {
    const variables = new Set<string>();

    for (let i = 0; i < index && index < this.steps.length; i++) {
      for (const variable of this.steps[i].boundVariables()) {
        variables.add(variable);
      }
    }
    return [...variables.values()];
  }

  get escapedName(): string {
    return escapeTemplateString(this.name);
  }
}
