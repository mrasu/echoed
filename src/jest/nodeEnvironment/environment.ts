import { patchFetch, restoreFetch } from "@/fetchPatch";
import { openBus, closeBus } from "@/openBus";
import { FileSpace } from "@/fileSpace";
import type { Global } from "@jest/types";

export class Environment {
  constructor(public testPath: string) {}

  async setup(
    global: Global.Global,
    tmpDir: string | undefined,
    workerID: string,
  ) {
    if (!tmpDir) {
      return;
    }

    const fileSpace = new FileSpace(tmpDir);
    patchFetch(fileSpace.testLogDir, this.testPath, global);

    const busFilePath = fileSpace.eventBusFilePath(workerID);
    await openBus(busFilePath, global);
  }

  async teardown(global: Global.Global) {
    closeBus(global);
    restoreFetch(global);
  }
}
