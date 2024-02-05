export const addOrOverride = <T>(
  origin: T[],
  merge: T[],
  keyFn: (_: T) => string,
): T[] => {
  const mergeTargetMap = new Map(merge.map((v) => [keyFn(v), v]));

  const originKeys = new Set<string>();
  const ret: T[] = [];
  for (const elm of origin) {
    const key = keyFn(elm);
    originKeys.add(key);

    const value = mergeTargetMap.get(key);

    if (value) {
      ret.push(value);
    } else {
      ret.push(elm);
    }
  }

  for (const elm of merge) {
    const key = keyFn(elm);
    if (!originKeys.has(key)) {
      ret.push(elm);
    }
  }

  return ret;
};
