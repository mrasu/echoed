import { FileSpace } from "@/fileSpace";
import { Environment } from "@/jest/nodeEnvironment/environment";
import { buildNodeEnvironment } from "@/testUtil/jest/nodeEnvironment";
import fs from "fs";
import os from "os";
import path from "path";

const WORKER_ID = "1";

describe("Environment", () => {
  let tmpdir: string;

  let defers: (() => void)[] = [];

  beforeEach(async () => {
    defers = [];

    tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "echoed-"));
    const fileSpace = new FileSpace(tmpdir);
    fileSpace.ensureDirectoryExistence();
    await fs.promises.writeFile(
      fileSpace.eventBusFilePath(WORKER_ID),
      "",
      "utf-8",
    );
  });

  afterEach(async () => {
    for (const defer of defers) {
      defer();
    }

    await fs.promises.rm(tmpdir, { recursive: true });
  });

  it("should patch fetch and restore after teardown", async () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    const originalFetch = global.fetch;

    const environment = new Environment("/path/to/example.test.js");
    await environment.setup(global, tmpdir, WORKER_ID);
    defers.push(() => {
      environment.teardown(global);
    });

    expect(global.fetch).not.toBe(originalFetch);

    environment.teardown(global);
    defers = [];

    expect(global.fetch).toBe(originalFetch);
  });

  it("should open bus and close after teardown", async () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    expect(global.__ECHOED_BUS__).not.toBeDefined();

    const environment = new Environment("/path/to/example.test.js");
    await environment.setup(global, tmpdir, WORKER_ID);
    defers.push(() => {
      environment.teardown(global);
    });

    expect(global.__ECHOED_BUS__).toBeDefined();

    environment.teardown(global);
    defers = [];

    expect(global.__ECHOED_BUS__).not.toBeDefined();
  });
});
