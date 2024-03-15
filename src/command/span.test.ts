import { waitForSpan } from "@/command/span";
import { EchoedFatalError } from "@/echoedFatalError";
import { deleteTmpDirFromEnv, setTmpDirToEnv } from "@/env";
import { WantSpanEvent } from "@/eventBus/spanBus";
import { deleteBusIdFromGlobalThis, setBusIdToGlobalThis } from "@/global";
import { DummyBus } from "@/testUtil/eventBus/dummyBus";
import { setTraceIdToResponse } from "@/traceLoggingFetch";
import { Base64String } from "@/type/base64String";
import fs from "fs";
import os from "os";
import path from "path";

describe("waitForSpan", () => {
  let res: Response;
  beforeEach(() => {
    res = {} as Response;
  });

  describe("when no traceId is set to response", () => {
    it("should raise error", async () => {
      await expect(async () => {
        await waitForSpan(
          res,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });

  describe("when traceId is set to response", () => {
    beforeEach(() => {
      setTraceIdToResponse(res, new Base64String("dummy-trace-id"));
    });

    describe("when bus is not set anywhere", () => {
      it("should raise error", async () => {
        await expect(async () => {
          await waitForSpan(
            res,
            {
              name: "dummy/name",
            },
            { timeoutMs: 0 },
          );
        }).rejects.toThrow(EchoedFatalError);
      });
    });

    describe("when bus is set in globalThis", () => {
      let bus: DummyBus<WantSpanEvent>;
      beforeEach(async () => {
        bus = new DummyBus();
        await bus.open();
        globalThis.__ECHOED_BUS__ = bus;
      });

      afterEach(() => {
        bus.close();
        delete globalThis.__ECHOED_BUS__;
      });

      it("should emit data to Bus", async () => {
        await expect(async () => {
          await waitForSpan(
            res,
            {
              name: "dummy/name",
            },
            { timeoutMs: 0 },
          );
        }).rejects.toThrow("timeout");
      });
    });

    describe("when busId is set in environment variable", () => {
      let tmpdirPath: string;

      beforeEach(() => {
        tmpdirPath = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
        setBusIdToGlobalThis("busId");
        setTmpDirToEnv(tmpdirPath);
      });

      afterEach(async () => {
        deleteBusIdFromGlobalThis();
        deleteTmpDirFromEnv();
        await fs.promises.rm(tmpdirPath, { recursive: true, force: true });
      });

      it("should emit data to Bus", async () => {
        await expect(async () => {
          await waitForSpan(
            res,
            {
              name: "dummy/name",
            },
            { timeoutMs: 0 },
          );
        }).rejects.toThrow("timeout");
      });
    });
  });
});
