import { ScenarioCompilePluginRunnerConfig } from "@/config/scenarioCompileConfig";
import { InvalidScenarioError } from "@/scenario/compile/invalidScenarioError";
import { RunnerOption } from "@/scenario/compile/runnerOption";

export class RunnerConfig {
  static parse(conf: ScenarioCompilePluginRunnerConfig): RunnerConfig {
    if (conf.name.startsWith("_")) {
      throw new InvalidScenarioError(
        `Runner name must not start with "_". This is reserved for internal use: ${conf.name}`,
      );
    }

    return new RunnerConfig(
      conf.name,
      conf.module,
      RunnerOption.parse(conf.option),
    );
  }

  constructor(
    public readonly name: string,
    public readonly module: string,
    public readonly option: RunnerOption,
  ) {}
}
