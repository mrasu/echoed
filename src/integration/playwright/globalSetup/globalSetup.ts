import { Config, ECHOED_CONFIG_FILE_NAME } from "@/config/config";
import { buildFsContainerForApp } from "@/fs/fsContainer";
import { LocalFile } from "@/fs/localFile";
import { throwError } from "@/integration/common/util/error";
import { SetupRunner } from "@/integration/playwright/globalSetup/setupRunner";
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
