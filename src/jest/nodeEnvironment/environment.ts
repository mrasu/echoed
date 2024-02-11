import { patchFetch, restoreFetch } from "@/fetchPatch";
import { FileLogger } from "@/fileLog/fileLogger";
import { IFileLogger } from "@/fileLog/iFileLogger";
import { FileSpace } from "@/fileSpace";
import { IDirectory } from "@/fs/iDirectory";
import { closeBus, openBus } from "@/openBus";
import type { Global } from "@jest/types";
import crypto from "crypto";

export class Environment {
  constructor(public testPath: string) {}

  async setup(
    global: Global.Global,
    tmpDir: IDirectory,
    workerID: string,
  ): Promise<void> {
    const fileSpace = new FileSpace(tmpDir);
    this.patchFetch(fileSpace.testLogDir, global);

    const busFile = fileSpace.createBusFile(workerID);
    await openBus(busFile, global);
  }

  teardown(global: Global.Global): void {
    closeBus(global);
    restoreFetch(global);
  }

  private patchFetch(tmpDir: IDirectory, global: Global.Global): void {
    const logger = this.createLogger(tmpDir);

    patchFetch(logger, this.testPath, global);
  }

  private createLogger(tmpDir: IDirectory): IFileLogger {
    const filename = crypto.randomUUID() + ".json";
    const file = tmpDir.newFile(filename);

    return new FileLogger(file);
  }
}
