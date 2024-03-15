import { FileSpace } from "@/fileSpace/fileSpace";
import { Hook } from "@/integration/playwright/internal/hook/hook";
import { PlaywrightCore } from "@/integration/playwright/internal/type";
import { MockDirectory } from "@/testUtil/fs/mockDirectory";
import { MockFileContents } from "@/testUtil/fs/mockFileContents";
import { buildPlaywrightTestInfo } from "@/testUtil/playwright/testInfo";

describe("Hook", () => {
  const buildHook = (): Hook => {
    const fileContents = new MockFileContents();
    const fileSpace = new FileSpace(new MockDirectory("mockDir", fileContents));

    const hook = new Hook(fileSpace);
    hook.prepareBeforeRun();

    return hook;
  };

  describe("extendTestScopeFixture", () => {
    it("should modify playwright", () => {
      const hook = buildHook();

      const playwright = {
        request: {},
      } as PlaywrightCore;
      const testInfo = buildPlaywrightTestInfo();
      const cleanup = hook.extendTestScopeFixture(playwright, testInfo);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(playwright.request.newContext).toBeDefined();

      cleanup();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(playwright.request.newContext).not.toBeDefined();
    });

    it("should modify fetch", () => {
      const origFetch = globalThis.fetch;

      const hook = buildHook();

      const playwright = {
        request: {},
      } as PlaywrightCore;
      const testInfo = buildPlaywrightTestInfo();
      const cleanup = hook.extendTestScopeFixture(playwright, testInfo);

      expect(origFetch).not.toBe(globalThis.fetch);

      cleanup();

      expect(origFetch).toBe(globalThis.fetch);
    });
  });
});
