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

export function transformToMap<T, U>(
  record: Record<string, T> | undefined,
  transform: (value: T) => U,
): Map<string, U> {
  if (!record) return new Map();

  const map = new Map<string, U>();
  for (const [key, value] of Object.entries(record)) {
    map.set(key, transform(value));
  }
  return map;
}

export function transformRecord<T, U>(
  record: Record<string, T> | undefined,
  transform: (value: T) => U,
): Record<string, U> | undefined {
  if (!record) return undefined;

  const map: Record<string, U> = {};
  for (const [key, value] of Object.entries(record)) {
    map[key] = transform(value);
  }
  return map;
}
