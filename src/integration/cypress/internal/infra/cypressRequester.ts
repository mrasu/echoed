import { promisify } from "@/integration/cypress/internal/util/promisify";
import { Requester } from "@/server/requester/requester";
import { Resp } from "@/server/requester/resp";

export class CypressRequester implements Requester {
  constructor(private timeoutMs: number) {}
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
        timeout: this.timeoutMs,
      })
      .then((response) => {
        return new Resp(response.status, response.body);
      });

    return promisify(chainable);
  }
}
