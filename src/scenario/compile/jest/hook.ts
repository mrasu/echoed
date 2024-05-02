import { Config } from "@/scenario/compile/common/config";
import { HookBase } from "@/scenario/compile/common/hookBase";
import {
  HookExecutor,
  HookExecutorSchema,
} from "@/scenario/compile/jest/hookExecutor";
import { z } from "zod";

export const HookSchema = z.strictObject({
  beforeAll: z.array(HookExecutorSchema).optional(),
  afterAll: z.array(HookExecutorSchema).optional(),
  beforeEach: z.array(HookExecutorSchema).optional(),
  afterEach: z.array(HookExecutorSchema).optional(),
});
export type HookSchema = z.infer<typeof HookSchema>;

export class Hook extends HookBase<HookExecutor> {
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
    beforeAll?: HookExecutor[],
    afterAll?: HookExecutor[],
    beforeEach?: HookExecutor[],
    afterEach?: HookExecutor[],
  ) {
    super(beforeAll, afterAll, beforeEach, afterEach);
  }
}
