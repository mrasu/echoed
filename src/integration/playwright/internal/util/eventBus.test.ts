import { EchoedFatalError } from "@/echoedFatalError";
import { deleteTmpDirFromEnv, setTmpDirToEnv } from "@/env";
import { FileBus } from "@/eventBus/infra/fileBus";
import { deleteBusIdFromGlobalThis, setBusIdToGlobalThis } from "@/global";
import { newBus } from "@/integration/playwright/internal/util/eventBus";
import { buildMockFsContainer } from "@/testUtil/fs/mockFsContainer";

describe("newBus", () => {
  const fsContainer = buildMockFsContainer();

  describe("when no busId is set to globalThis", () => {
    it("should raise error", () => {
      expect(() => {
        newBus(fsContainer, false);
      }).toThrow(EchoedFatalError);
    });
  });

  describe("when busId is set to globalThis", () => {
    beforeEach(() => {
      setBusIdToGlobalThis("busId");
    });

    afterEach(() => {
      deleteBusIdFromGlobalThis();
    });

    it("should raise error", () => {
      expect(() => {
        newBus(fsContainer, false);
      }).toThrow(EchoedFatalError);
    });

    describe("when tmpDir is set to environment variable", () => {
      beforeEach(() => {
        setTmpDirToEnv("tmpDirPath");
      });

      afterEach(() => {
        deleteTmpDirFromEnv();
      });

      it("should return bus", () => {
        const fsContainer = buildMockFsContainer();
        const bus = newBus(fsContainer, false);

        expect(bus).toBeInstanceOf(FileBus);
      });
    });
  });
});
