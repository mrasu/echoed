import { Environment } from "@/jest/nodeEnvironment/environment";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { buildNodeEnvironment } from "@/testUtil/jest/nodeEnvironment";

const DUMMY_TMP_DIR = "echoed-";
const WORKER_ID = "1";

describe("Environment", () => {
  let defers: (() => void)[] = [];

  beforeEach(() => {
    defers = [];
  });

  afterEach(() => {
    for (const defer of defers) {
      defer();
    }
  });

  it("should patch fetch and restore after teardown", async () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    const originalFetch = global.fetch;

    const environment = new Environment("/path/to/example.test.js");
    await environment.setup(
      global,
      new MockDirectory(DUMMY_TMP_DIR),
      WORKER_ID,
    );
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
    await environment.setup(
      global,
      new MockDirectory(DUMMY_TMP_DIR),
      WORKER_ID,
    );
    defers.push(() => {
      environment.teardown(global);
    });

    expect(global.__ECHOED_BUS__).toBeDefined();

    environment.teardown(global);
    defers = [];

    expect(global.__ECHOED_BUS__).not.toBeDefined();
  });
});
