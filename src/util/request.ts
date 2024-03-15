const BODY_READABLE_CONTENT_TYPES = ["application/json", "text/"];

export function isReadableContentType(contentType: string): boolean {
  const lowerCaseContentType = contentType.toLowerCase();

  for (const type of BODY_READABLE_CONTENT_TYPES) {
    if (lowerCaseContentType.includes(type)) {
      return true;
    }
  }

  return false;
}
