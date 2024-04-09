import { isReadableContentType } from "@/util/request";

export async function readResponseText(response: Response): Promise<string> {
  const contentType = extractLowerCaseContentType(response);

  if (isReadableContentType(contentType)) {
    return await response.text();
  }

  return buildNotDisplayableMessage(contentType);
}

function extractLowerCaseContentType(response: Response): string {
  for (const [key, value] of response.headers.entries()) {
    if (key.toLowerCase() === "content-type") {
      return value;
    }
  }

  return "";
}

export function buildNotDisplayableMessage(origContentType?: string): string {
  if (origContentType === undefined) {
    return "[Not displayable]";
  }

  const ct = origContentType || "unknown";
  return `[Not displayable. content-type=${ct}]`;
}
