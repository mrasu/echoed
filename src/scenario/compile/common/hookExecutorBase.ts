import { TsVariable } from "@/scenario/compile/common/tsVariable";

export abstract class HookExecutorBase {
  protected constructor(public readonly bind?: Map<string, TsVariable>) {}

  boundVariables(): string[] {
    return [...(this.bind?.keys() ?? [].values())];
  }
}
