import { Config } from "@/config/config";
import { setServerPortToEnv, setTmpDirToEnv } from "@/env";
import { FileSpace } from "@/fileSpace/fileSpace";
import { FsContainer } from "@/fs/fsContainer";
import { Server } from "@/server/server";
import os from "os";
import path from "path";

export class SetupRunner {
  constructor(
    private fsContainer: FsContainer,
    private echoedConfig: Config,
  ) {}

  async run(): Promise<() => Promise<void>> {
    const tmpdir = this.fsContainer.mkdtempSync(
      path.join(os.tmpdir(), "echoed-"),
    );
    setTmpDirToEnv(tmpdir.path);

    const fileSpace = new FileSpace(tmpdir);
    fileSpace.ensureDirectoryExistence();

    const serverPort = this.echoedConfig.serverPort;
    const server = await Server.start(serverPort);
    setServerPortToEnv(serverPort);

    const serverStopAfter = this.echoedConfig.serverStopAfter;

    return async function () {
      const { capturedSpans, capturedLogs } =
        await server.stopAfter(serverStopAfter);

      await fileSpace.otelDir.spanFile.write(
        JSON.stringify(Object.fromEntries(capturedSpans)),
      );
      await fileSpace.otelDir.logFile.write(
        JSON.stringify(Object.fromEntries(capturedLogs)),
      );
    };
  }
}
