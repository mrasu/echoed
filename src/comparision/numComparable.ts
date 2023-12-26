import { Comparable, Primitive } from "@/comparision/comparable";
import { opentelemetry } from "@/generated/otelpbj";
import Long from "long";

export abstract class NumComparable extends Comparable {
  protected constructor(protected value: number) {
    super();
  }

  protected matchIAnyVal(
    target: opentelemetry.proto.common.v1.IAnyValue,
  ): boolean {
    const valueNum = target.intValue || target.doubleValue || undefined;
    if (!valueNum) return false;

    return this.matchNumber(valueNum);
  }

  protected abstract matchNumber(target: number | Long): boolean;

  matchString(_: string | null | undefined): boolean {
    return false;
  }

  protected toJsonObj(): Record<string, Primitive> {
    return {
      value: this.value,
    };
  }
}
