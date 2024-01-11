export function override<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const ret: Record<string, any> = structuredClone(target);

  for (const [key, value] of Object.entries(source)) {
    if (!value) continue;

    if (Array.isArray(value)) {
      ret[key] = value;
      continue;
    }

    if (typeof value === "object") {
      ret[key] = override(ret[key] ?? {}, value);
      continue;
    }

    ret[key] = value;
  }

  return ret as T;
}
