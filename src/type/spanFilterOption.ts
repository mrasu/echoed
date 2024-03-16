import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Reg } from "@/comparision/reg";
import {
  JsonStringComparable,
  restoreComparables,
  restoreStringComparable,
} from "@/comparision/restore";
import { z } from "zod";

export type SpanFilterOption = {
  name?: Eq | Reg;
  // Use Record instead of Map because JSON.stringify doesn't serialize Map.
  //  e.g. JSON.stringify(new Map([["a",1]])) returns {} insteadof {"a":1}
  attributes: Record<string, Comparable>;
  resource: {
    attributes: Record<string, Comparable>;
  };
};

export const JsonSpanFilterOption = z.strictObject({
  name: JsonStringComparable.optional(),
  attributes: z.record(z.string(), JsonStringComparable),
  resource: z.strictObject({
    attributes: z.record(z.string(), JsonStringComparable),
  }),
});

export type JsonSpanFilterOption = z.infer<typeof JsonSpanFilterOption>;

export function restoreSpanFilterOption(
  data: JsonSpanFilterOption,
): SpanFilterOption {
  return {
    name: data.name ? restoreStringComparable(data.name) : undefined,
    attributes: restoreComparables(data.attributes),
    resource: {
      attributes: restoreComparables(data.resource?.attributes),
    },
  };
}
