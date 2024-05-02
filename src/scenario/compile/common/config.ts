import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { EnvConfig } from "@/scenario/compile/common/envConfig";
import { PluginConfig } from "@/scenario/compile/common/pluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";

export class Config {
  static parse(
    schema: ScenarioCompileConfig,
    defaultRunners: RunnerConfig[],
    defaultAsserters: AsserterConfig[],
    defaultCommonPlugins: CommonPluginConfig[],
  ): Config {
    const env = EnvConfig.parse(schema.env);
    const plugin = PluginConfig.parse(
      schema.plugin,
      defaultRunners,
      defaultAsserters,
      defaultCommonPlugins,
    );
    return new Config(schema.retry, env, plugin);
  }

  constructor(
    public readonly retry: number,
    public readonly env: EnvConfig,
    public readonly plugin: PluginConfig,
  ) {}
}
