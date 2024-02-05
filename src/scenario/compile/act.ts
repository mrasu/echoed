import { Config } from "@/scenario/compile/config";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const ActSchema = z.object({
  runner: z.string(),
  argument: JsonSchema.optional(),
  option: z.record(JsonSchema).optional(),
});
export type ActSchema = z.infer<typeof ActSchema>;

export class Act {
  static parse(config: Config, act: ActSchema): Act | undefined {
    const name = act.runner;
    if (!config.plugin.hasRunner(name)) {
      throw new InvalidScenarioError(
        `Unregistered runner found. Make sure the runner is registered in the configuration: ${name}`,
      );
    }

    const argument = act.argument ? TsVariable.parse(act.argument) : undefined;
    const option = RunnerOption.parse(act.option);

    return new Act(name, argument, option);
  }

  constructor(
    public readonly name: string,
    public readonly argument: TsVariable | undefined,
    public readonly option: RunnerOption,
  ) {}
}
