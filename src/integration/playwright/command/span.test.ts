import { EchoedFatalError } from "@/echoedFatalError";
import { deleteTmpDirFromEnv, setTmpDirToEnv } from "@/env";
import { deleteBusIdFromGlobalThis, setBusIdToGlobalThis } from "@/global";
import {
  waitForSpanCreatedIn,
  waitForSpanFromPlaywrightFetch,
} from "@/integration/playwright";
import { setTraceIdToAPIResponse } from "@/integration/playwright/internal/util/apiResponse";
import { setTraceIdToContext } from "@/integration/playwright/internal/util/browserContext";
import {
  buildBrowserContext,
  buildInitializedBrowserContext,
} from "@/testUtil/playwright/browserContext";
import { Base64String } from "@/type/base64String";
import { APIResponse } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";

const beforeEachFn = (): string => {
  const tmpdirPath = fs.mkdtempSync(path.join(os.tmpdir(), "echoed-"));
  setBusIdToGlobalThis("busId");
  setTmpDirToEnv(tmpdirPath);
  return tmpdirPath;
};

const afterEachFn = async (tmpdirPath: string): Promise<void> => {
  deleteBusIdFromGlobalThis();
  deleteTmpDirFromEnv();
  await fs.promises.rm(tmpdirPath, { recursive: true, force: true });
};

describe("waitForSpanCreatedIn", () => {
  let tmpdirPath: string;

  beforeEach(() => {
    tmpdirPath = beforeEachFn();
  });

  afterEach(async () => {
    await afterEachFn(tmpdirPath);
  });

  describe("when context holds matching trace", () => {
    it("should emit data to Bus", async () => {
      const context = buildInitializedBrowserContext();
      setTraceIdToContext(
        context,
        "https://example.com/dummy",
        new Base64String("traceId"),
      );

      await expect(async () => {
        await waitForSpanCreatedIn(
          context,
          /.+/,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");
    });
  });

  describe("when context doesn't hold matching trace", () => {
    it("raise error", async () => {
      const context = buildInitializedBrowserContext();

      await expect(async () => {
        await waitForSpanCreatedIn(
          context,
          /.+/,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });

  describe("when context is not initialized", () => {
    it("raise error", async () => {
      const context = buildBrowserContext();

      await expect(async () => {
        await waitForSpanCreatedIn(
          context,
          /.+/,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });
});

describe("waitForSpanFromPlaywrightFetch", () => {
  let tmpdirPath: string;

  beforeEach(() => {
    tmpdirPath = beforeEachFn();
  });

  afterEach(async () => {
    await afterEachFn(tmpdirPath);
  });

  describe("when response holds matching trace", () => {
    it("should emit data to Bus", async () => {
      const response = {} as APIResponse;
      setTraceIdToAPIResponse(response, new Base64String("traceId"));

      await expect(async () => {
        await waitForSpanFromPlaywrightFetch(
          response,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow("timeout");
    });
  });

  describe("when response doesn't hold matching trace", () => {
    it("should emit data to Bus", async () => {
      const response = {} as APIResponse;

      await expect(async () => {
        await waitForSpanFromPlaywrightFetch(
          response,
          {
            name: "dummy/name",
          },
          { timeoutMs: 0 },
        );
      }).rejects.toThrow(EchoedFatalError);
    });
  });
});
