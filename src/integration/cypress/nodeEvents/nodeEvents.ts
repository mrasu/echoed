import { ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { loadConfig } from "@/integration/common/util/config";
import { throwError } from "@/integration/common/util/error";
import {
  setServerPortToCypressEnv,
  setTmpDirToCypressEnv,
} from "@/integration/cypress/internal/util/env";
import { EventListener } from "@/integration/cypress/nodeEvents/eventListener";
import { ReportFile } from "@/report/reportFile";
import { Server } from "@/server/server";
import * as Cypress from "cypress";
import os from "os";
import path from "path";

const ECHOED_ROOT_DIR = path.resolve(__dirname, "../../../");

export function install(
  on: Cypress.PluginEvents,
  options: Cypress.PluginConfigOptions,
): Cypress.PluginConfigOptions {
  const fsContainer = buildFsContainerForApp();
  const cwd = process.cwd();
  const configFilepath = path.join(cwd, ECHOED_CONFIG_FILE_NAME);
  const configFile = new LocalFile(configFilepath);

  const echoedConfig = loadConfig(fsContainer, configFile);
  const tmpdir = fsContainer.mkdtempSync(path.join(os.tmpdir(), "echoed-"));

  setTmpDirToCypressEnv(options, tmpdir.path);
  setServerPortToCypressEnv(options, echoedConfig.serverPort);

  process.env.echoedTmpDir = tmpdir.path;

  const eventListener = new EventListener(
    cwd,
    echoedConfig,
    async (port: number): Promise<Server> => {
      return await Server.start(port);
    },
  );

  on("before:run", async (): Promise<void> => {
    await run(async () => {
      await eventListener.onBeforeRun(tmpdir);
    });
  });

  on("after:run", async (): Promise<void> => {
    await run(async () => {
      const reportFile = new ReportFile(
        echoedConfig,
        fsContainer.newDirectory(ECHOED_ROOT_DIR),
      );

      await eventListener.onAfterRun(reportFile);
    });
  });

  on("before:browser:launch", async (): Promise<void> => {
    await run(async () => {
      await eventListener.onBeforeBrowserLaunch(tmpdir);
    });
  });

  return options;
}

async function run(fn: () => Promise<void>): Promise<void> {
  try {
    return await fn();
  } catch (e) {
    throwError(e);
  }
}
