import { ScenarioCompileConfig } from "@/config/scenarioCompileConfig";
import { IDirectory } from "@/fs/iDirectory";
import { AsserterConfig } from "@/scenario/compile/common/asserterConfig";
import { CommonPluginConfig } from "@/scenario/compile/common/commonPluginConfig";
import { RunnerConfig } from "@/scenario/compile/common/runnerConfig";
import { RunnerOption } from "@/scenario/compile/common/runnerOption";
import { ScenarioBook } from "@/scenario/compile/jest/scenarioBook";
import { ScenarioBookParser } from "@/scenario/compile/jest/scenarioBookParser";
import { ScenarioCompiler } from "@/scenario/compile/scenarioCompiler";
import { ZodError } from "zod";

const ETA_TEMPLATE_DIR_FROM_ROOT_DIR = "scenario/template";
const ETA_ROOT_FILE_NAME = "jest/root.eta";

const DEFAULT_RUNNER_NAMES = ["fetch", "waitForSpan"];
const DEFAULT_RUNNERS = DEFAULT_RUNNER_NAMES.map((name) => {
  return new RunnerConfig(
    name,
    "echoed/scenario/gen/jest/runner",
    new RunnerOption(new Map()),
  );
});

const DEFAULT_ASSERTER_NAMES = ["assertStatus"];
const DEFAULT_ASSERTERS = DEFAULT_ASSERTER_NAMES.map((name) => {
  return new AsserterConfig(
    name,
    "echoed/scenario/gen/jest/asserter",
    new Map(),
  );
});

const DEFAULT_COMMON_PLUGINS = [] as CommonPluginConfig[];

export class JestScenarioCompiler extends ScenarioCompiler<ScenarioBook> {
  constructor(echoedRootDir: IDirectory, compileConfig: ScenarioCompileConfig) {
    super(
      echoedRootDir,
      compileConfig,
      DEFAULT_RUNNERS,
      DEFAULT_ASSERTERS,
      DEFAULT_COMMON_PLUGINS,
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
