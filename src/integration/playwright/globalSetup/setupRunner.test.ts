import { Config } from "@/config/config";
import { PropagationTestConfig } from "@/config/propagationTestConfig";
import { deleteTmpDirFromEnv, getTmpDirFromEnv } from "@/env";
import { FsContainer } from "@/fs/fsContainer";
import { SetupRunner } from "@/integration/playwright/globalSetup/setupRunner";
import { Logger } from "@/logger";
import { MockFile } from "@/testUtil/fs/mockFile";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";
import { buildFullConfig } from "@/testUtil/playwright/fullConfig";

beforeEach(() => {
  Logger.setEnable(false);
});

afterEach(() => {
  Logger.setEnable(true);
  deleteTmpDirFromEnv();
});

describe("SetupRunner", () => {
  let defers: (() => Promise<void>)[] = [];
  beforeEach(() => {
    defers = [];
  });
  afterEach(async () => {
    for (const defer of defers) {
      await defer();
    }
  });

  describe("run", () => {
    const createSetupRunner = (fsContainer: FsContainer): SetupRunner => {
      const echoedConfig = new Config(
        new MockFile(true),
        13333,
        0,
        false,
        new PropagationTestConfig({
          enabled: false,
          ignore: {
            attributes: new Map(),
            resource: {
              attributes: new Map(),
            },
            conditions: [],
          },
        }),
        [],
        undefined,
      );
      const playwrightConfig = buildFullConfig();
      return new SetupRunner(fsContainer, echoedConfig, playwrightConfig);
    };

    const getFilePathFromName = (
      fileContents: MockFileContents,
      name: string,
    ): string | undefined => {
      for (const key of fileContents.files.keys()) {
        if (key.endsWith("/" + name)) {
          return key;
        }
      }
    };

    it("should create files holding otel data", async () => {
      const fsContainer = buildMockFsContainer();
      const runner = createSetupRunner(fsContainer);

      const cleanup = await runner.run();
      defers.push(cleanup);
      await cleanup();

      const span = fsContainer.fileContents.get(
        getFilePathFromName(fsContainer.fileContents, "span.jsonl") ?? "",
      );
      expect(span).toBeDefined();

      const log = fsContainer.fileContents.get(
        getFilePathFromName(fsContainer.fileContents, "log.jsonl") ?? "",
      );
      expect(log).toBeDefined();
    });

    it("should set environment variables", async () => {
      const fsContainer = buildMockFsContainer();
      const runner = createSetupRunner(fsContainer);

      expect(getTmpDirFromEnv()).toBeUndefined();

      const cleanup = await runner.run();
      defers.push(cleanup);

      expect(getTmpDirFromEnv()).toBeDefined();
    });
  });
});
