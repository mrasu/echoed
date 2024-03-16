import { AttributeValueOption, SpanFilterOption } from "@/command/span";
import { Comparable } from "@/comparision/comparable";
import { Eq } from "@/comparision/eq";
import { Gt } from "@/comparision/gt";
import { Gte } from "@/comparision/gte";
import { Lt } from "@/comparision/lt";
import { Lte } from "@/comparision/lte";
import { Reg } from "@/comparision/reg";
import { SpanFilterOption as InternalSpanFilterOption } from "@/type/spanFilterOption";

export function convertSpanFilterOption(
  option: SpanFilterOption,
): InternalSpanFilterOption {
  const result: InternalSpanFilterOption = {
    name: convertSpanFilterName(option.name),
    attributes: convertSpanFilterAttributeOption(option.attributes),
    resource: {
      attributes: convertSpanFilterAttributeOption(option.resource?.attributes),
    },
  };

  return result;
}

function convertSpanFilterName(
  name: SpanFilterOption["name"],
): InternalSpanFilterOption["name"] {
  if (!name) return undefined;

  if (typeof name === "string") {
    return new Eq(name);
  } else {
    return new Reg(name);
  }
}

function convertSpanFilterAttributeOption(
  attributeOption: Record<string, AttributeValueOption> | undefined,
): Record<string, Comparable> {
  if (!attributeOption) return {};

  const ret: Record<string, Comparable> = {};
  for (const key in attributeOption) {
    ret[key] = convertToComparable(attributeOption[key]);
  }

  return ret;
}

function convertToComparable(value: AttributeValueOption): Comparable {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return new Eq(value);
  }

  if (value instanceof RegExp) {
    return new Reg(value);
  }

  switch (value.kind) {
    case "eq":
      return new Eq(value.value);
    case "gt":
      return new Gt(value.value);
    case "gte":
      return new Gte(value.value);
    case "lt":
      return new Lt(value.value);
    case "lte":
      return new Lte(value.value);
  }
}
