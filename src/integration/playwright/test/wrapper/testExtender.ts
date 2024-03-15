import { FileSpace } from "@/fileSpace/fileSpace";
import { Hook } from "@/integration/playwright/internal/hook/hook";
import { PlaywrightCore } from "@/integration/playwright/internal/type";
import { BrowserContext, TestInfo } from "@playwright/test";

export class TestExtender {
  private readonly hook: Hook;

  constructor(fileSpace: FileSpace) {
    this.hook = new Hook(fileSpace);
  }

  async prepareBeforeRun(use: () => Promise<void>): Promise<void> {
    this.hook.prepareBeforeRun();

    await use();
  }

  async extendTestScopeFixture(
    playwright: PlaywrightCore,
    use: () => Promise<void>,
    testInfo: TestInfo,
  ): Promise<void> {
    const cleanup = this.hook.extendTestScopeFixture(playwright, testInfo);

    await use().finally(cleanup);
  }

  async extendContext(
    context: BrowserContext,
    use: (_: BrowserContext) => Promise<void>,
    testInfo: TestInfo,
  ): Promise<void> {
    const extendedContext = await this.hook.extendContext(context, testInfo);

    await use(extendedContext);
  }
}
