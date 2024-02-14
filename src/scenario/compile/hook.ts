import { Config } from "@/scenario/compile/config";
import {
  HookExecutor,
  HookExecutorSchema,
} from "@/scenario/compile/hookExecutor";
import { z } from "zod";

export const HookSchema = z.object({
  beforeAll: z.array(HookExecutorSchema).optional(),
  afterAll: z.array(HookExecutorSchema).optional(),
  beforeEach: z.array(HookExecutorSchema).optional(),
  afterEach: z.array(HookExecutorSchema).optional(),
});
export type HookSchema = z.infer<typeof HookSchema>;

const ORDERED_HOOK_TYPES = [
  "beforeAll",
  "beforeEach",
  "afterEach",
  "afterAll",
] as const;

type HookType = (typeof ORDERED_HOOK_TYPES)[number];

export class Hook {
  static parse(config: Config, schema: HookSchema | undefined): Hook {
    if (!schema) return new Hook();

    const beforeAll = Hook.parseExecutors(config, schema.beforeAll);
    const afterAll = Hook.parseExecutors(config, schema.afterAll);
    const beforeEach = Hook.parseExecutors(config, schema.beforeEach);
    const afterEach = Hook.parseExecutors(config, schema.afterEach);

    return new Hook(beforeAll, afterAll, beforeEach, afterEach);
  }

  private static parseExecutors(
    config: Config,
    schemas: HookExecutorSchema[] | undefined,
  ): HookExecutor[] | undefined {
    if (!schemas) return undefined;

    return schemas.map((schema) => HookExecutor.parse(config, schema));
  }

  constructor(
    public readonly beforeAll?: HookExecutor[],
    public readonly afterAll?: HookExecutor[],
    public readonly beforeEach?: HookExecutor[],
    public readonly afterEach?: HookExecutor[],
  ) {}

  hookTypesBefore(hookType: HookType): string[] {
    const types = [];
    for (const type of ORDERED_HOOK_TYPES) {
      if (type === hookType) break;

      types.push(type);
    }

    return types;
  }

  getBoundVariablesBefore(
    currentHookType: HookType,
    currentHookIndex: number,
  ): IterableIterator<string> {
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

    return variables.values();
  }
}
