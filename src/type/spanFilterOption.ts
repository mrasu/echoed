import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import {
  restoreComparables,
  restoreStringComparable,
} from "@/comparision/restore";

export type SpanFilterOption = {
  name?: Eq | Reg;
  // Use Record instead of Map because JSON.stringify doesn't serialize Map.
  //  e.g. JSON.stringify(new Map([["a",1]])) returns {} insteadof {"a":1}
  attributes: Record<string, Comparable>;
  resource: {
    attributes: Record<string, Comparable>;
  };
};

export type jsonSpanFilterOption = {
  name?: unknown;
  attributes: Record<string, unknown>;
  resource: {
    attributes: Record<string, unknown>;
  };
};

export function restoreSpanFilterOption(
  data: jsonSpanFilterOption,
): SpanFilterOption {
  return {
    name: restoreStringComparable(data.name),
    attributes: restoreComparables(data.attributes),
    resource: {
      attributes: restoreComparables(data.resource?.attributes),
    },
  };
}
