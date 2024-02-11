#!/usr/bin/env node

import { AnsiGreen, AnsiReset } from "@/ansi";
import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { Creator } from "@/create/create";
import { EchoedError } from "@/echoedError";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalDirectory } from "@/fs/localDirectory";
import { LocalFile } from "@/fs/localFile";
import { Logger } from "@/logger";
import { YamlScenarioCompiler } from "@/scenario/compile/yamlScenarioCompiler";
import { program } from "commander";
import fs from "fs";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../");

program.name("echoed");

program
  .command("create-sample")
  .description("create sample files for Echoed")
  .action(() => {
    runCreateSample();
  });

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

function runCreateSample(): void {
  const cwd = process.cwd();
  if (fs.existsSync(cwd)) {
    if (fs.readdirSync(cwd).length > 0) {
      Logger.error("Current directory is not empty.");
      Logger.error("  To initialize Echoed, please use empty directory.");
      process.exit(1);
    }
  }

  const creator = new Creator(ECHOED_ROOT_DIR, cwd);
  void creator.run().then(() => {
    console.log(`Finish initializing Echoed.

The initialization also creates example tests to demonstrate Echoed's behavior.
Refer ${AnsiGreen}README.md${AnsiReset} to run the tests.
`);
  });
}

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
