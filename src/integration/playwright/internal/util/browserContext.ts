import { EchoedFatalError } from "@/echoedFatalError";
import { Base64String } from "@/type/base64String";
import { BrowserContext } from "@playwright/test";

type EchoedContext = {
  traces: [string, Base64String][];
};

const echoedContextPropertyName = "__echoed_ctx";
export type WrappedBrowserContext = {
  [echoedContextPropertyName]: EchoedContext | undefined;
};

function getEchoedContext(context: BrowserContext): EchoedContext {
  const ctx = (context as unknown as WrappedBrowserContext)[
    echoedContextPropertyName
  ];

  if (!ctx) {
    throw new EchoedFatalError(
      "Echoed is not initialized for Playwright's context. not using test produced by Echoed?",
    );
  }

  return ctx;
}

export function initializeEchoedContext(context: BrowserContext): void {
  (context as unknown as WrappedBrowserContext)[echoedContextPropertyName] = {
    traces: [],
  };
}

export function setTraceIdToContext(
  context: BrowserContext,
  url: string,
  traceId: Base64String,
): void {
  const traces = getEchoedContext(context).traces;
  traces.push([url, traceId]);
}

export function getLastTraceIdFromContext(
  context: BrowserContext,
  url: string | RegExp,
): Base64String | undefined {
  const traces = getEchoedContext(context).traces;
  if (!traces) {
    return undefined;
  }

  const trace = traces.reverse().find((t) => {
    if (url instanceof RegExp) {
      return url.test(t[0]);
    }
    return t[0] === url;
  });

  return trace?.[1];
}
