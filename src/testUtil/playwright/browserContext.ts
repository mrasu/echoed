import { initializeEchoedContext } from "@/integration/playwright/internal/util/browserContext";
import { BrowserContext } from "@playwright/test";
import { mock } from "jest-mock-extended";
import { MockProxy } from "jest-mock-extended/lib/Mock";

export function buildBrowserContext(): MockProxy<BrowserContext> {
  const ctx = mock<BrowserContext>();

  return ctx;
}

export function buildInitializedBrowserContext(): MockProxy<BrowserContext> {
  const ctx = buildBrowserContext();
  initializeEchoedContext(ctx);

  return ctx;
}
