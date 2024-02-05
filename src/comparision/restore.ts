import { Comparable } from "@/comparision/comparable";
import { Eq, JsonEq } from "@/comparision/eq";
import { Gt, JsonGt } from "@/comparision/gt";
import { Gte, JsonGte } from "@/comparision/gte";
import { JsonLt, Lt } from "@/comparision/lt";
import { JsonLte, Lte } from "@/comparision/lte";
import { JsonReg, Reg } from "@/comparision/reg";
import { neverVisit } from "@/util/never";
import { z } from "zod";

const JsonComparable = z.discriminatedUnion("kind", [
  JsonEq,
  JsonGt,
  JsonGte,
  JsonLt,
  JsonLte,
  JsonReg,
]);

type JsonComparable = z.infer<typeof JsonComparable>;

export function restoreComparables(
  obj: Record<string, unknown> | undefined,
): Record<string, Comparable> {
  if (!obj) return {};

  const ret: Record<string, Comparable> = {};
  for (const [key, value] of Object.entries(obj)) {
    ret[key] = restoreComparable(JsonComparable.parse(value));
  }

  return ret;
}

function restoreComparable(obj: JsonComparable): Comparable {
  return restoreComparableFromKind(obj);
}

function restoreComparableFromKind(obj: JsonComparable): Comparable {
  switch (obj.kind) {
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
    default:
      neverVisit("unknown kind", obj);
  }
}

const JsonStringComparable = z.discriminatedUnion("kind", [JsonEq, JsonReg]);

export function restoreStringComparable(orig: unknown): Reg | Eq {
  const obj = JsonStringComparable.parse(orig);
  switch (obj.kind) {
    case "eq":
      return Eq.fromJsonObj(obj);
    case "reg":
      return Reg.fromJsonObj(obj);
    default:
      neverVisit("unknown kind", obj);
  }
}
