import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { EchoedError } from "@/echoedError";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { SetupRunner } from "@/integration/playwright/globalSetup/setupRunner";
import { Logger } from "@/logger";
import { type FullConfig } from "@playwright/test";
import path from "path";

type TeardownFn = () => Promise<void>;

export default async function globalSetup(
  _playwrightConfig: FullConfig,
): Promise<TeardownFn> {
  const fsContainer = buildFsContainerForApp();
  const configFilepath = path.join(process.cwd(), ECHOED_CONFIG_FILE_NAME);
  const configFile = new LocalFile(configFilepath);

  try {
    const echoedConfig = Config.load(fsContainer, configFile);

    const runner = new SetupRunner(fsContainer, echoedConfig);
    return await runner.run();
  } catch (e) {
    throwError(e);
  }
}

function throwError(e: unknown): never {
  if (e instanceof EchoedError) {
    // Add new line to emphasize message.
    // Because long message including stacktrace will be printed after `throw e`, we need to emphasize message somehow.
    Logger.ln(2);
    Logger.error(e.message);
    Logger.ln(2);
  }

  throw e;
}
