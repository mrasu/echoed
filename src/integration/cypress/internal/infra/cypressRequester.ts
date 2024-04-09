import { promisify } from "@/integration/cypress/internal/util/promisify";
import { Requester } from "@/server/requester";
import { Resp } from "@/server/resp";

// Set the timeout to 10,100 ms because timeout of `/events/wantSpan` is 10,000 ms.
const REQUEST_TIMEOUT = 10_100;

export class CypressRequester implements Requester {
  post(
    url: string,
    origHeaders: Record<string, string>,
    body: string,
  ): Promise<Resp> {
    const headers = {
      ...origHeaders,
      "Content-Type": "text/plain;charset=UTF-8",
    };

    const chainable = cy
      .request<string>({
        url,
        headers,
        method: "POST",
        encoding: "utf8",
        body: body,
        timeout: REQUEST_TIMEOUT,
      })
      .then((response) => {
        return new Resp(response.status, response.body);
      });

    return promisify(chainable);
  }
}
