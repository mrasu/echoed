import { patchFetch, restoreFetch } from "@/fetchPatch";
import { FileLogger } from "@/fileLog/fileLogger";
import { IFileLogger } from "@/fileLog/iFileLogger";
import { FileSpace } from "@/fileSpace/fileSpace";
import { IDirectory } from "@/fs/iDirectory";
import { closeBus, openBus } from "@/openBus";
import type { Global } from "@jest/types";

export class Environment {
  constructor(public testPath: string) {}

  async setup(
    global: Global.Global,
    tmpDir: IDirectory,
    workerID: string,
  ): Promise<void> {
    const fileSpace = new FileSpace(tmpDir);
    this.patchFetch(fileSpace, global);

    const busFile = fileSpace.createBusFile(workerID);
    await openBus(busFile, global);
  }

  teardown(global: Global.Global): void {
    closeBus(global);
    restoreFetch(global);
  }

  private patchFetch(fileSpace: FileSpace, global: Global.Global): void {
    const logger = this.createLogger(fileSpace);

    patchFetch(logger, this.testPath, global);
  }

  private createLogger(fileSpace: FileSpace): IFileLogger {
    const file = fileSpace.createTestLogFile();

    return new FileLogger(file);
  }
}
