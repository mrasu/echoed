import { Environment } from "@/integration/jest/nodeEnvironment/environment";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { buildNodeEnvironment } from "@/testUtil/jest/nodeEnvironment";

const DUMMY_TMP_DIR = "echoed-";

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

  it("should patch fetch and restore after teardown", () => {
    const nodeEnvironment = buildNodeEnvironment();
    const global = nodeEnvironment.global;

    const originalFetch = global.fetch;

    const environment = new Environment("/path/to/example.test.js");
    environment.setup(global, new MockDirectory(DUMMY_TMP_DIR));
    defers.push(() => {
      environment.teardown(global);
    });

    expect(global.fetch).not.toBe(originalFetch);

    environment.teardown(global);
    defers = [];

    expect(global.fetch).toBe(originalFetch);
  });
});
