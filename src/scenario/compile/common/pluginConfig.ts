import { ScenarioCompilePluginConfig } from "@/config/scenarioCompileConfig";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { PluginLister } from "@/scenario/compile/common/pluginLister";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { addOrOverride } from "@/util/array";

export class PluginConfig {
  static parse(
    conf: ScenarioCompilePluginConfig,
    defaultRunners: RunnerConfig[],
    defaultAsserters: AsserterConfig[],
    defaultCommonPlugins: CommonPluginConfig[],
  ): PluginConfig {
    const runners = addOrOverride(
      defaultRunners,
      conf.runners.map((runner) => RunnerConfig.parse(runner)),
      (runner) => runner.name,
    );

    const asserters = addOrOverride(
      defaultAsserters,
      conf.asserters.map((asserter) => AsserterConfig.parse(asserter)),
      (asserter) => asserter.name,
    );

    const commons = [
      ...defaultCommonPlugins,
      ...conf.commons.map((comm) => CommonPluginConfig.parse(comm)),
    ];

    return new PluginConfig(runners, asserters, commons);
  }

  private readonly runnerNames: Set<string>;
  private readonly asserterNames: Set<string>;

  constructor(
    public readonly runners: RunnerConfig[],
    public readonly asserters: AsserterConfig[],
    public readonly commons: CommonPluginConfig[],
  ) {
    this.runnerNames = new Set(runners.map((runner) => runner.name));
    this.asserterNames = new Set(asserters.map((asserter) => asserter.name));
  }

  hasRunner(runnerName: string): boolean {
    return this.runnerNames.has(runnerName);
  }

  getUsedRunners(pluginLister: PluginLister): RunnerConfig[] {
    const usedRunners = pluginLister.getUsedRunners();

    return this.runners.filter((runner) => usedRunners.has(runner.name));
  }

  hasAsserter(asserterName: string): boolean {
    return this.asserterNames.has(asserterName);
  }

  getUsedAsserters(pluginLister: PluginLister): AsserterConfig[] {
    const usedAsserters = pluginLister.getUsedAsserters();

    return this.asserters.filter((runner) => usedAsserters.has(runner.name));
  }
}
