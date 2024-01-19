export function override<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const ret: Record<string, unknown> = structuredClone(target);

  for (const [key, value] of Object.entries(source)) {
    if (!value) continue;

    if (Array.isArray(value)) {
      ret[key] = value;
      continue;
    }

    if (typeof value === "object") {
      const valRecord = value as Record<string, unknown>;
      const retElm = ret[key];
      if (typeof retElm === "object") {
        const retRecordElm = retElm as Record<string, unknown>;
        ret[key] = override(retRecordElm ?? {}, valRecord);
        continue;
      }
    }

    ret[key] = value;
  }

  return ret as T;
}
