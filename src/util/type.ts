export function hasValue<T>(val: T | undefined | null): val is T {
  return val !== undefined && val !== null;
}
