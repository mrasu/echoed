import { Comparable, Primitive } from "@/comparision/comparable";
import { opentelemetry } from "@/generated/otelpbj";
import { Kind } from "@/comparision/kind";

export class Eq extends Comparable {
  constructor(private value: Primitive) {
    super();
  }

  protected matchIAnyVal(
    target: opentelemetry.proto.common.v1.IAnyValue,
  ): boolean {
    if (typeof this.value === "string") {
      return this.matchString(target.stringValue);
    } else if (typeof this.value === "number") {
      if (target.intValue) {
        return this.value === target.intValue;
      } else if (target.doubleValue) {
        return this.value === target.doubleValue;
      }
      return false;
    } /*(typeof target === "boolean")*/ else {
      return this.value === target.boolValue;
    }
  }

  matchString(target: string | null | undefined): boolean {
    return this.value === target;
  }

  protected get kind(): Kind {
    return "eq";
  }

  protected toJsonObj(): Record<string, Primitive> {
    return {
      value: this.value,
    };
  }

  static fromJsonObj(obj: any): Eq {
    return new Eq(obj.value);
  }
}
