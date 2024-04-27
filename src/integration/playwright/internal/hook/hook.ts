import { EchoedFatalError } from "@/echoedFatalError";
import { FileLogger } from "@/fileLog/fileLogger";
import { TestActionLogger } from "@/fileLog/testActionLogger";
import { FileSpace } from "@/fileSpace/fileSpace";
import { ApiRequestProxyFetchRunner } from "@/integration/playwright/internal/hook/apiRequestProxyFetchRunner";
import { GlobalFetchRunner } from "@/integration/playwright/internal/hook/globalFetchRunner";
import { RouteFetchRunner } from "@/integration/playwright/internal/hook/routeFetchRunner";
import { PlaywrightCore } from "@/integration/playwright/internal/type";
import { initializeEchoedContext } from "@/integration/playwright/internal/util/browserContext";
import {
  APIRequest,
  APIRequestContext,
  BrowserContext,
  TestInfo,
} from "@playwright/test";

export class Hook {
  testActionLogger: TestActionLogger | undefined;

  constructor(private fileSpace: FileSpace) {}

  prepareBeforeRun(): void {
    const file = this.fileSpace.createTestLogFile();
    const fileLogger = new FileLogger(file);
    this.testActionLogger = new TestActionLogger(fileLogger);
  }

  extendTestScopeFixture(
    playwright: PlaywrightCore,
    testInfo: TestInfo,
  ): () => void {
    const testActionLogger = this.mustGetTestActionLogger();

    const playwrightCleanup = this.patchPlaywright(
      testActionLogger,
      playwright,
      testInfo,
    );
    const fetchCleanup = this.patchFetch(testActionLogger, testInfo);

    return () => {
      fetchCleanup();
      playwrightCleanup();
    };
  }

  private mustGetTestActionLogger(): TestActionLogger {
    const testActionLogger = this.testActionLogger;
    if (!testActionLogger) {
      throw new EchoedFatalError(
        "Logger is not initialized. not using test produced by Echoed?",
      );
    }
    return testActionLogger;
  }

  private patchFetch(
    testActionLogger: TestActionLogger,
    testInfo: TestInfo,
  ): () => void {
    const originalFetch = globalThis.fetch;
    const globalFetchRunner = new GlobalFetchRunner(
      testActionLogger,
      originalFetch,
    );

    const customFetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      return globalFetchRunner.run(testInfo, input, init);
    };

    globalThis.fetch = customFetch;

    globalThis.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ): Promise<Response> => {
      return globalFetchRunner.run(testInfo, input, init);
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  }

  private patchPlaywright(
    testActionLogger: TestActionLogger,
    playwright: PlaywrightCore,
    testInfo: TestInfo,
  ): () => void {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const newContextOrigFn = playwright.request.newContext;

    playwright.request.newContext = async (
      ...args: Parameters<APIRequest["newContext"]>
    ): Promise<APIRequestContext> => {
      const context = await newContextOrigFn.apply(playwright.request, args);

      return this.buildAPIRequestContextProxy(
        testActionLogger,
        context,
        testInfo,
      );
    };

    return () => {
      playwright.request.newContext = newContextOrigFn;
    };
  }

  private buildAPIRequestContextProxy(
    testActionLogger: TestActionLogger,
    requestContext: APIRequestContext,
    testInfo: TestInfo,
  ): APIRequestContext {
    const proxyFetchRunner = new ApiRequestProxyFetchRunner(testActionLogger);

    const proxy = new Proxy(requestContext, {
      get(target, property, receiver): unknown {
        switch (property) {
          case "fetch":
            return async (...args: Parameters<APIRequestContext["fetch"]>) => {
              return proxyFetchRunner.run(target, receiver, testInfo, ...args);
            };
          default:
            return Reflect.get(target, property, receiver);
        }
      },
    });

    return proxy;
  }

  async extendContext(
    context: BrowserContext,
    testInfo: TestInfo,
  ): Promise<BrowserContext> {
    initializeEchoedContext(context);

    const testActionLogger = this.mustGetTestActionLogger();
    await this.hookRouteRequest(testActionLogger, context, testInfo);

    return this.buildBrowserContextProxy(testActionLogger, context, testInfo);
  }

  private async hookRouteRequest(
    testActionLogger: TestActionLogger,
    context: BrowserContext,
    testInfo: TestInfo,
  ): Promise<void> {
    const fetchRunner = new RouteFetchRunner(testActionLogger);
    await context.route("**", async (route) => {
      await fetchRunner.run(route, context, testInfo);
    });
  }

  private buildBrowserContextProxy(
    testActionLogger: TestActionLogger,
    context: BrowserContext,
    testInfo: TestInfo,
  ): BrowserContext {
    const requestProxy = this.buildAPIRequestContextProxy(
      testActionLogger,
      context.request,
      testInfo,
    );

    const contextProxy = new Proxy(context, {
      get(target, property, receiver): unknown {
        switch (property) {
          case "request":
            return requestProxy;
          default:
            return Reflect.get(target, property, receiver);
        }
      },
    });

    return contextProxy;
  }
}
