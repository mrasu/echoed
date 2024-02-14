import { ArrangeRunner } from "@/scenario/compile/arrangeRunner";
import { Config } from "@/scenario/compile/config";
import { RawString } from "@/scenario/compile/rawString";
import {
  RunnerContainer,
  RunnerContainerSchema,
} from "@/scenario/compile/runnerContainer";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

const ArrangeRunnerSchema = RunnerContainerSchema.and(
  z.object({ bind: z.record(JsonSchema).optional() }),
);

export const ArrangeSchema = z.union([
  z.string(),
  ArrangeRunnerSchema,
  z.object({
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
    public readonly rawString?: RawString,
    public readonly runner?: ArrangeRunner,
    public readonly bind?: Map<string, TsVariable>,
  ) {}

  boundVariables(): string[] {
    if (this.runner) return this.runner.boundVariables();
    if (this.bind) return [...this.bind.keys()];
    return [];
  }
}
