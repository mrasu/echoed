import { Resp } from "@/server/requester/resp";

export interface Requester {
  post(
    url: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<Resp>;
}
