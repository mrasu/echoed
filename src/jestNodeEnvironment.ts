import NodeEnvironment from "jest-environment-node";
import { patchFetch, restoreFetch } from "./fetchPatch";
import { getTmpDirFromEnv } from "./env";

export class JestNodeEnvironment extends NodeEnvironment {
  testPath: string;

  constructor(config: any, context: any) {
    super(config, context);

    this.testPath = context.testPath;
  }

  async setup() {
    await super.setup();

    const tmpDir = getTmpDirFromEnv();
    if (!tmpDir) {
      console.warn(
        "No output due to invalid setting for Tobikura: no tmpDir. reporter is not set?",
      );
    }

    patchFetch(tmpDir, this.testPath, this.global);
  }

  async teardown() {
    restoreFetch();
  }
}
