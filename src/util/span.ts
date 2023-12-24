import { opentelemetry } from "@/generated/otelpbj";

type AttributeValue = string | number | boolean;

export function matchAttributeValue(
  val: opentelemetry.proto.common.v1.IAnyValue | undefined | null,
  target: AttributeValue,
): boolean {
  if (!val) return false;

  if (typeof target === "string") {
    return target === val.stringValue;
  } else if (typeof target === "number") {
    return target === val.intValue || target === val.doubleValue;
  } /*(typeof target === "boolean")*/ else {
    return target === val.boolValue;
  }
}
