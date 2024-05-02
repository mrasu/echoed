import { ScenarioCompilePluginAsserterConfig } from "@/config/scenarioCompileConfig";
import { InvalidScenarioError } from "@/scenario/compile/common/invalidScenarioError";
import { TsVariable } from "@/scenario/compile/common/tsVariable";
import { transformToMap } from "@/util/record";

export class AsserterConfig {
  static parse(conf: ScenarioCompilePluginAsserterConfig): AsserterConfig {
    if (conf.name.startsWith("_")) {
      throw new InvalidScenarioError(
        `Asserter name must not start with "_". This is reserved for internal use: ${conf.name}`,
      );
    }

    const option = transformToMap(conf.option, (v) => TsVariable.parse(v));
    return new AsserterConfig(conf.name, conf.module, option);
  }

  constructor(
    public readonly name: string,
    public readonly module: string,
    public readonly option: Map<string, TsVariable>,
  ) {}
}
