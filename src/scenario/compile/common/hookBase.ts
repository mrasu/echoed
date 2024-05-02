import { HookExecutorBase } from "@/scenario/compile/common/hookExecutorBase";

const ORDERED_HOOK_TYPES = [
  "beforeAll",
  "beforeEach",
  "afterEach",
  "afterAll",
] as const;

type HookType = (typeof ORDERED_HOOK_TYPES)[number];

export abstract class HookBase<T extends HookExecutorBase> {
  protected constructor(
    public readonly beforeAll?: T[],
    public readonly afterAll?: T[],
    public readonly beforeEach?: T[],
    public readonly afterEach?: T[],
  ) {}

  hookTypesBefore(hookType: HookType): string[] {
    const types: HookType[] = [];
    for (const type of ORDERED_HOOK_TYPES) {
      if (type === hookType) break;

      types.push(type);
    }

    return types;
  }

  getBoundVariablesBefore(
    currentHookType: HookType,
    currentHookIndex: number,
  ): string[] {
    const variables = new Set<string>();
    for (const t of ORDERED_HOOK_TYPES) {
      const isCurrentType = t === currentHookType;

      const executors = this[t] ?? [];
      for (let i = 0; i < executors.length; i++) {
        if (isCurrentType && i === currentHookIndex) break;

        const executor = executors[i];
        for (const variable of executor.boundVariables()) {
          variables.add(variable);
        }
      }

      if (isCurrentType) break;
    }

    return [...variables.values()];
  }
}
