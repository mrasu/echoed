import { Span } from "@/command/spanType";
import { EchoedFatalError } from "@/echoedFatalError";
import { SuccessResponse } from "@/server/parameter/commonParameter";
import { State } from "@/server/parameter/stateParameter";
import { TestFinishedEventRequestParam } from "@/server/parameter/testFinishedParameter";
import {
  WaitForSpanEventRequestObjectParam,
  WaitForSpanEventResponse,
  restoreWaitForSpanEventResponse,
} from "@/server/parameter/waitForSpanParameter";
import { Requester } from "@/server/requester/requester";
import { Resp } from "@/server/requester/resp";

export const USER_AGENT_HEADER_KEY = "User-Agent";
export const ECHOED_USER_AGENT = "echoed/0.0.1";

export async function requestWaitForSpanEvent(
  requester: Requester,
  port: number,
  param: WaitForSpanEventRequestObjectParam,
): Promise<Span> {
  const response = await post(requester, port, "/events/waitForSpan", param);
  const jsonResponse = WaitForSpanEventResponse.parse(
    JSON.parse(response.body),
  );
  const resp = restoreWaitForSpanEventResponse(jsonResponse);

  if ("error" in resp) {
    throw new EchoedFatalError(
      `Error happens while waiting for span. ${resp.reason}`,
    );
  }

  return resp.span;
}

export async function requestTestFinishedEvent(
  requester: Requester,
  port: number,
  param: TestFinishedEventRequestParam,
): Promise<boolean> {
  const response = await post(requester, port, "/events/testFinished", param);
  const jsonResponse = SuccessResponse.parse(JSON.parse(response.body));

  return jsonResponse.success;
}

export async function requestStateEvent(
  requester: Requester,
  port: number,
  name: string,
  state: State,
): Promise<boolean> {
  const response = await post(requester, port, "/events/state", {
    name,
    state,
  });
  const jsonResponse = SuccessResponse.parse(JSON.parse(response.body));

  return jsonResponse.success;
}

export async function post(
  requester: Requester,
  port: number,
  path: string,
  param: unknown,
): Promise<Resp> {
  const url = new URL(path, `http://localhost:${port}`).toString();

  return await requester.post(
    url,
    {
      [USER_AGENT_HEADER_KEY]: ECHOED_USER_AGENT,
    },
    JSON.stringify(param),
  );
}
