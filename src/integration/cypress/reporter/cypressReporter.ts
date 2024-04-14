import { ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { loadConfig } from "@/integration/common/util/config";
import {
  getServerPortFromEnv,
  setServerPortToEnv,
} from "@/integration/common/util/env";
import { Reporter } from "@/integration/cypress/reporter/reporter";
import { buildRandomHexBytes } from "@/util/random";
import { MochaOptions, Runner, Test, reporters } from "mocha";
import path from "path";

const { EVENT_RUN_BEGIN, EVENT_RUN_END, EVENT_TEST_END, EVENT_TEST_BEGIN } =
  Runner.constants;

export class CypressReporter extends reporters.Base {
  constructor(runner: Runner, options?: MochaOptions) {
    super(runner, options);

    const serverPort = this.getServerPort();
    const runName = `cy-run:${buildRandomHexBytes(8)}`;
    const reporter = new Reporter(serverPort, runName);

    runner
      .once(EVENT_RUN_BEGIN, () => {
        reporter.onRunBegin();
      })
      .on(EVENT_TEST_BEGIN, (test: Test) => {
        reporter.onTestBegin(test);
      })
      .on(EVENT_TEST_END, (test: Test) => {
        reporter.onTestEnd(test);
      })
      .once(EVENT_RUN_END, () => {
        reporter.onRunEnd();
      });
  }

  private getServerPort(): number {
    const envServerPort = getServerPortFromEnv();
    if (envServerPort) {
      return envServerPort;
    }

    const fsContainer = buildFsContainerForApp();
    const configFilepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
    const configFile = new LocalFile(configFilepath);

    const echoedConfig = loadConfig(fsContainer, configFile);
    const serverPort = echoedConfig.serverPort;
    setServerPortToEnv(serverPort);

    return serverPort;
  }
}
