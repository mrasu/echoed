import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { IDirectory } from "@/fs/iDirectory";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { ScenarioBook } from "@/scenario/compile/playwright/scenarioBook";
import { ScenarioBookParser } from "@/scenario/compile/playwright/scenarioBookParser";
import { ScenarioCompiler } from "@/scenario/compile/scenarioCompiler";
import { ZodError } from "zod";

const ETA_TEMPLATE_DIR_FROM_ROOT_DIR = "scenario/template";
const ETA_ROOT_FILE_NAME = "playwright/root.eta";

const DEFAULT_RUNNERS = [
  new RunnerConfig(
    "waitForSpanCreatedIn",
    "echoed/scenario/gen/playwright/runner",
    new RunnerOption(new Map()),
  ),
  new RunnerConfig(
    "waitForSpanFromPlaywrightFetch",
    "echoed/scenario/gen/playwright/runner",
    new RunnerOption(new Map()),
  ),
];

const DEFAULT_ASSERTERS = [] as AsserterConfig[];

const DEFAULT_COMMON_PLUGINS = [
  new CommonPluginConfig(["test"], undefined, "echoed/playwright/test"),
  new CommonPluginConfig(["expect"], undefined, "@playwright/test"),
];
const DEFAULT_NO_OTEL_COMMON_PLUGINS = [
  new CommonPluginConfig(["test", "expect"], undefined, "@playwright/test"),
];

export class PlaywrightScenarioCompiler extends ScenarioCompiler<ScenarioBook> {
  constructor(echoedRootDir: IDirectory, compileConfig: ScenarioCompileConfig) {
    const useEchoedFeatures = compileConfig.targets[0].useEchoedFeatures;
    const commonPlugins = useEchoedFeatures
      ? DEFAULT_COMMON_PLUGINS
      : DEFAULT_NO_OTEL_COMMON_PLUGINS;

    super(
      echoedRootDir,
      compileConfig,
      DEFAULT_RUNNERS,
      DEFAULT_ASSERTERS,
      commonPlugins,
      ETA_TEMPLATE_DIR_FROM_ROOT_DIR,
      ETA_ROOT_FILE_NAME,
    );
  }

  protected override parseScenarioBook(
    ymlObject: unknown,
  ): ScenarioBook | { success: false; error: ZodError } {
    const parser = new ScenarioBookParser(this.scenarioCompileConfig);
    return parser.parse(ymlObject);
  }
}
