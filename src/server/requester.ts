import { Resp } from "@/server/resp";

export interface Requester {
  post(
    url: string,
    headers: Record<string, string>,
    body: string,
  ): Promise<Resp>;
}
