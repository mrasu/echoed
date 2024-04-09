import { buildNotDisplayableMessage } from "@/integration/common/util/response";

export function toDisplayableRequestBody(body: unknown): string | null {
  if (body === null || body === undefined) {
    return null;
  }

  if (typeof body === "string") {
    return body;
  }

  return buildNotDisplayableMessage();
}
