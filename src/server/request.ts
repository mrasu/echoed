import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import {
  restoreWantSpanEventResponse,
  WantSpanEventRequestParam,
} from "@/server/parameter";

export const USER_AGENT_HEADER_KEY = "User-Agent";
export const ECHOED_USER_AGENT = "echoed/0.0.1";

export async function requestWantSpanEvent(
  port: number,
  wantSpanEventRequest: WantSpanEventRequestParam,
): Promise<Span> {
  const response = await post(port, "/events/wantSpan", wantSpanEventRequest);
  const jsonResponse = (await response.json()) as unknown;
  const resp = restoreWantSpanEventResponse(jsonResponse);

  if ("error" in resp) {
    throw new EchoedFatalError(
      `Error happens while waiting for span. ${resp.reason}`,
    );
  }

  return resp.span;
}

async function post(
  port: number,
  path: string,
  param: unknown,
): Promise<Response> {
  const url = new URL(path, `http://localhost:${port}`).toString();

  return await fetch(url, {
    method: "POST",
    headers: {
      [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
    },
    body: JSON.stringify(param),
  });
}
