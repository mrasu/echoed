export function normalizeHeaders(
  headers: Record<string, string | string[]>,
): Map<string, string[]> {
  const normalizedHeaders = new Map<string, string[]>();

  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalizedHeaders.set(key, value);
    } else {
      normalizedHeaders.set(key, [value]);
    }
  }
  return normalizedHeaders;
}

export function normalizeRequestOptionHeaders(
  headers: Partial<Cypress.RequestOptions>["headers"],
): Map<string, string[]> {
  const normalized = new Map<string, string[]>();

  if (!headers) return normalized;
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      normalized.set(
        key,
        value.filter((v): v is string => typeof v === "string"),
      );
    } else {
      if (typeof value === "string") {
        normalized.set(key, [value]);
      }
    }
  }

  return normalized;
}
