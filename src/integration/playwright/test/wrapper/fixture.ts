import { getFileSpace } from "@/integration/playwright/internal/util/fileSpace";
import { TestExtender } from "@/integration/playwright/test/wrapper/testExtender";
import { test as playwrightTest } from "@playwright/test";

type PlaywrightTest = typeof playwrightTest;

export const extendTest = (base: PlaywrightTest): PlaywrightTest => {
  const fileSpace = getFileSpace();
  const testExtender = new TestExtender(fileSpace);

  return base.extend<{ _echoedObj: void }, { _echoedWorkerObj: void }>({
    _echoedObj: [
      async ({ playwright }, use, testInfo): Promise<void> => {
        await testExtender.extendTestScopeFixture(playwright, use, testInfo);
      },
      { auto: true },
    ],
    context: async (
      // Require `_echoedObj` to ensure `context` is called after preparing `_echoedObj`.
      { context, _echoedObj: _echoedObj },
      use,
      testInfo,
    ): Promise<void> => {
      await testExtender.extendContext(context, use, testInfo);
    },
    _echoedWorkerObj: [
      // eslint-disable-next-line no-empty-pattern
      async ({}, use): Promise<void> => {
        await testExtender.prepareBeforeRun(use);
      },
      { auto: true, scope: "worker" },
    ],
  });
};
