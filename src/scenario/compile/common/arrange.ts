import { ArrangeRunner } from "@/scenario/compile/common/arrangeRunner";
import { Config } from "@/scenario/compile/common/config";
import { RawString } from "@/scenario/compile/common/rawString";
import {
  RunnerContainer,
  RunnerContainerSchema,
} from "@/scenario/compile/common/runnerContainer";
import { TsString } from "@/scenario/compile/common/tsString";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

const ArrangeRunnerSchema = RunnerContainerSchema.merge(
  z.strictObject({ bind: z.record(JsonSchema).optional() }),
);

export const ArrangeSchema = z.union([
  z.string(),
  ArrangeRunnerSchema,
  z.strictObject({
    bind: z.record(JsonSchema),
  }),
]);
export type ArrangeSchema = z.infer<typeof ArrangeSchema>;

export class Arrange {
  static parse(config: Config, arrange: ArrangeSchema): Arrange {
    if (typeof arrange === "string") {
      return new Arrange(new RawString(arrange));
    }

    if ("runner" in arrange) {
      const runnerContainer = RunnerContainer.parse(config, arrange);
      const bind = TsVariable.parseRecord(arrange.bind);

      const runner = new ArrangeRunner(runnerContainer, bind);
      return new Arrange(undefined, runner);
    }

    const bind = TsVariable.parseRecord(arrange.bind);
    return new Arrange(undefined, undefined, bind);
  }

  constructor(
    public readonly tsString?: TsString,
    public readonly runner?: ArrangeRunner,
    public readonly bind?: Map<string, TsVariable>,
  ) {}

  boundVariables(): string[] {
    if (this.runner) return this.runner.boundVariables();
    if (this.bind) return [...this.bind.keys()];
    return [];
  }
}
