import { Config } from "@/config/config";
import { setTmpDirToEnv } from "@/env";
import { FileSpace } from "@/fileSpace/fileSpace";
import { IFile } from "@/fs/IFile";
import { FsContainer } from "@/fs/fsContainer";
import { Server } from "@/server";
import type { FullConfig } from "@playwright/test";
import os from "os";
import path from "path";

export class SetupRunner {
  constructor(
    private fsContainer: FsContainer,
    private echoedConfig: Config,
    private playwrightConfig: FullConfig,
  ) {}

  async run(): Promise<() => Promise<void>> {
    const tmpdir = this.fsContainer.mkdtempSync(
      path.join(os.tmpdir(), "echoed-"),
    );
    setTmpDirToEnv(tmpdir.path);

    const fileSpace = new FileSpace(tmpdir);
    fileSpace.ensureDirectoryExistence();

    const buses = this.createBusFiles(fileSpace, this.playwrightConfig.workers);

    const serverPort = this.echoedConfig.serverPort;
    const server = await Server.start(serverPort, buses);

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

  private createBusFiles(fileSpace: FileSpace, count: number): IFile[] {
    const buses: IFile[] = [];
    for (let i = 0; i < count; i++) {
      buses.push(fileSpace.createBusFile(i.toString()));
    }
    return buses;
  }
}
