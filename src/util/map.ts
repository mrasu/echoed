export function arrayToMap<T, K, V>(
  vals: T[],
  fn: (v: T) => [K, V],
): Map<K, V> {
  const res = new Map<K, V>();
  for (const val of vals) {
    const [k, v] = fn(val);
    res.set(k, v);
  }

  return res;
}
