import { Config } from "@/scenario/compile/config";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { RunnerOption } from "@/scenario/compile/runnerOption";
import { TsVariable } from "@/scenario/compile/tsVariable";
import { JsonSchema } from "@/type/jsonZod";
import { z } from "zod";

export const RunnerContainerSchema = z.strictObject({
  runner: z.string(),
  argument: JsonSchema.optional(),
  option: z.record(JsonSchema).optional(),
});
export type RunnerContainerSchema = z.infer<typeof RunnerContainerSchema>;

export class RunnerContainer {
  static parse(config: Config, schema: RunnerContainerSchema): RunnerContainer {
    const name = schema.runner;
    if (!config.plugin.hasRunner(name)) {
      throw new InvalidScenarioError(
        `Unregistered runner found. Make sure the runner is registered in the configuration: ${name}`,
      );
    }

    const argument = schema.argument
      ? TsVariable.parse(schema.argument)
      : undefined;
    const option = RunnerOption.parse(schema.option);

    return new RunnerContainer(name, argument, option);
  }

  constructor(
    public readonly name: string,
    public readonly argument: TsVariable | undefined,
    public readonly option: RunnerOption,
  ) {}
}
