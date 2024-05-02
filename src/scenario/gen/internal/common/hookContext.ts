import { BoundVariables } from "@/scenario/gen/internal/common/type";

export type HookResult = {
  newBoundVariables: BoundVariables;
};

export class HookContext {
  public newBoundVariables: BoundVariables = {};

  constructor(public readonly boundVariables: BoundVariables) {}

  bindNewVariable(key: string, value: any): void {
    this.newBoundVariables[key] = value;
  }

  get result(): HookResult {
    return {
      newBoundVariables: this.newBoundVariables,
    };
  }
}
