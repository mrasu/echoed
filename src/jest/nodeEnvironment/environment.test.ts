import { Environment } from "@/jest/nodeEnvironment/environment";
import fs from "fs";
import path from "path";
import os from "os";
import { FileSpace } from "@/fileSpace";
import { buildNodeEnvironment } from "@/testUtil/jest/nodeEnvironment";

const WORKER_ID = "1";

describe("Environment", () => {
  let tmpdir: string;

  let defers: (() => Promise<void>)[] = [];

  beforeEach(async () => {
    defers = [];

    tmpdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "tobikura-"));
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
      await defer();
    }

    await fs.promises.rm(tmpdir, { recursive: true });
  });

  it("should patch fetch and restore after teardown", async () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    const originalFetch = global.fetch;

    const environment = new Environment("/path/to/example.test.js");
    await environment.setup(global, tmpdir, WORKER_ID);
    defers.push(async () => {
      await environment.teardown(global);
    });

    expect(global.fetch).not.toBe(originalFetch);

    await environment.teardown(global);
    defers = [];

    expect(global.fetch).toBe(originalFetch);
  });

  it("should open bus and close after teardown", async () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    expect(global.__TOBIKURA_BUS__).not.toBeDefined();

    const environment = new Environment("/path/to/example.test.js");
    await environment.setup(global, tmpdir, WORKER_ID);
    defers.push(async () => {
      await environment.teardown(global);
    });

    expect(global.__TOBIKURA_BUS__).toBeDefined();

    await environment.teardown(global);
    defers = [];

    expect(global.__TOBIKURA_BUS__).not.toBeDefined();
  });
});
