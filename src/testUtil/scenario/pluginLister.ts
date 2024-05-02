import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { PluginLister } from "@/scenario/compile/common/pluginLister";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";

class DummyScenarioBookBase implements PluginLister {
  private readonly usedAsserters: Set<string>;
  private readonly usedRunners: Set<string>;

  constructor(
    asserterConfigs: AsserterConfig[],
    runnerConfigs: RunnerConfig[],
  ) {
    this.usedAsserters = new Set(
      asserterConfigs.map((asserterConfig) => asserterConfig.name),
    );

    this.usedRunners = new Set(
      runnerConfigs.map((runnerConfig) => runnerConfig.name),
    );
  }

  getUsedAsserters(): Set<string> {
    return this.usedAsserters;
  }

  getUsedRunners(): Set<string> {
    return this.usedRunners;
  }
}

const DEFAULT_RUNNERS = {
  asserterConfigs: [] as AsserterConfig[],
  runnerConfigs: [] as RunnerConfig[],
};

export function buildPluginLister(
  runnerConfigs: Partial<typeof DEFAULT_RUNNERS> = {},
): PluginLister {
  const runners = { ...DEFAULT_RUNNERS, ...runnerConfigs };
  return new DummyScenarioBookBase(
    runners.asserterConfigs,
    runners.runnerConfigs,
  );
}
