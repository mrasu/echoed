import { Requester } from "@/server/requester/requester";
import { Resp } from "@/server/requester/resp";

export class FetchRequester implements Requester {
  async post(
    url: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<Resp> {
    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    return new Resp(res.status, await res.text());
  }
}
