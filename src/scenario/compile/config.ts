import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { EnvConfig } from "@/scenario/compile/envConfig";
import { PluginConfig } from "@/scenario/compile/pluginConfig";

export class Config {
  static parse(schema: ScenarioCompileConfig): Config {
    const env = EnvConfig.parse(schema.env);
    const plugin = PluginConfig.parse(schema.plugin);
    return new Config(schema.retry, env, plugin);
  }

  constructor(
    public readonly retry: number,
    public readonly env: EnvConfig,
    public readonly plugin: PluginConfig,
  ) {}
}
