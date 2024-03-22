import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";

// ComparableValue is representation for `Comparable` in config files.
type ComparableValue = string | boolean | number | { regexp: string };

export function convertToComparables(
  values: Record<string, ComparableValue> | undefined,
): Map<string, Comparable> {
  if (!values) return new Map();

  const ret = new Map<string, Comparable>();
  for (const [key, val] of Object.entries(values)) {
    const cmp = convertToComparable(val);
    ret.set(key, cmp);
  }
  return ret;
}

export function convertToComparable(val: ComparableValue): Comparable {
  if (typeof val === "object") {
    return Reg.fromString(val.regexp);
  } else {
    return new Eq(val);
  }
}
