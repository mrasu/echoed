import { EchoedFatalError } from "@/echoedFatalError";
import { TraceHistory } from "@/integration/common/traceHistory";
import { Base64String } from "@/type/base64String";

type EchoedContext = {
  traces: TraceHistory;
};

const echoedContextPropertyName = "__echoed_ctx";
export type WrappedCypressContext = {
  [echoedContextPropertyName]: EchoedContext | undefined;
};

function getEchoedContext(spec: Cypress.Spec): EchoedContext {
  const ctx = (spec as unknown as WrappedCypressContext)[
    echoedContextPropertyName
  ];

  if (!ctx) {
    throw new EchoedFatalError(
      "Echoed is not initialized for Cypress's context. not using test produced by Echoed?",
    );
  }

  return ctx;
}

export function initializeEchoedContext(spec: Cypress.Spec): void {
  (spec as unknown as WrappedCypressContext)[echoedContextPropertyName] = {
    traces: new TraceHistory(),
  };
}

export function setTraceIdToCypressSpec(
  spec: Cypress.Spec,
  url: string,
  traceId: Base64String,
): void {
  const traces = getEchoedContext(spec).traces;
  traces.push(url, traceId);
}

export function getLastTraceIdFromCypressSpec(
  spec: Cypress.Spec,
  pattern: string | RegExp,
): Base64String | undefined {
  const traces = getEchoedContext(spec).traces;
  if (!traces) {
    return undefined;
  }

  return traces.getLastTraceId(pattern);
}
