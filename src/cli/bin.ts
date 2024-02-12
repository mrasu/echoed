#!/usr/bin/env node

import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { EchoedError } from "@/echoedError";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalDirectory } from "@/fs/localDirectory";
import { LocalFile } from "@/fs/localFile";
import { Logger } from "@/logger";
import { YamlScenarioCompiler } from "@/scenario/compile/yamlScenarioCompiler";
import { program } from "commander";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../");

program.name("echoed");

program
  .command("compile")
  .description("compile YAML scenario files to test files")
  .action(async () => {
    try {
      await runCompile();
    } catch (e) {
      if (e instanceof EchoedError) {
        Logger.error(e.message);
        Logger.debug(e.stack);
      } else {
        throw e;
      }

      process.exit(1);
    }
  });

program.parse();

async function runCompile(): Promise<void> {
  const cwd = process.cwd();
  const configFile = new LocalFile(path.join(cwd, ECHOED_CONFIG_FILE_NAME));

  const fsContainer = buildFsContainerForApp();
  const config = Config.load(fsContainer, configFile);
  Logger.setShowDebug(config.debug);

  if (!config.compileConfig) {
    Logger.error(
      `Invalid configuration. Compile option is not defined in config file`,
    );
    return;
  }

  const compiler = new YamlScenarioCompiler(
    new LocalDirectory(ECHOED_ROOT_DIR),
    config.compileConfig,
  );

  await compiler.compileAll(new LocalDirectory(cwd));
}
