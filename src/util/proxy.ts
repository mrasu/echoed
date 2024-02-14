/**
 * buildRelativeIndexableArray creates a proxy object that can be accessed with relative position by negative index.
 * The result array thinks the last element is the "current" element.
 * So, `-1` means the "previous" element, `-2` means the "previous previous" element, and so on.
 *
 * For example:
 * ```ts
 * const arr = buildRelativeIndexableArray([1, 2, 3]);
 * arr[0] // 1
 * arr[1] // 2
 * arr[-1] // 2
 * ```
 */
export const buildRelativeIndexableArray = <T>(orig: T[]): T[] => {
  const copy = [...orig];

  const proxied = new Proxy(copy, {
    get: (target, p, receiver): T => {
      if (typeof p == "symbol") {
        return Reflect.get(target, p, receiver) as T;
      }
      const index = Number(p);
      if (isNaN(index)) {
        return Reflect.get(target, p, receiver) as T;
      }

      if (index >= 0) {
        return target[index];
      } else {
        return target[target.length - 1 + index];
      }
    },
  });

  return proxied;
};
