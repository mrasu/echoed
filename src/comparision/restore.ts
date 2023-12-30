import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";
import { Kind, toKind } from "@/comparision/kind";

export function restoreComparables(
  obj: Record<string, any> | undefined,
): Record<string, Comparable> {
  if (!obj) return {};

  const ret: Record<string, Comparable> = {};
  for (const [key, value] of Object.entries(obj)) {
    ret[key] = restoreComparable(value);
  }

  return ret;
}

function restoreComparable(obj: any): Comparable {
  const kind = toKind(obj.kind);
  if (!kind) {
    throw new Error(`Unknown kind: ${obj.kind}`);
  }

  return restoreComparableFromKind(kind, obj);
}

function restoreComparableFromKind(kind: Kind, obj: any): Comparable {
  switch (kind) {
    case "eq":
      return Eq.fromJsonObj(obj);
    case "gt":
      return Gt.fromJsonObj(obj);
    case "gte":
      return Gte.fromJsonObj(obj);
    case "lt":
      return Lt.fromJsonObj(obj);
    case "lte":
      return Lte.fromJsonObj(obj);
    case "reg":
      return Reg.fromJsonObj(obj);
  }
}

export function restoreStringComparable(obj: any): Reg | Eq {
  switch (obj.kind) {
    case "eq":
      return Eq.fromJsonObj(obj);
    case "reg":
      return Reg.fromJsonObj(obj);
  }
  throw new Error(`Unknown kind: ${obj.kind}`);
}
