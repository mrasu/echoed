import { Comparable } from "@/comparision/comparable";
import { opentelemetry } from "@/generated/otelpbj";
import Long from "long";
import { z } from "zod";

export const JsonNumComparable = z.strictObject({ value: z.number() });
export type JsonNumComparable = z.infer<typeof JsonNumComparable>;

export abstract class NumComparable extends Comparable {
  protected constructor(protected value: number) {
    super();
  }

  protected matchIAnyVal(
    target: opentelemetry.proto.common.v1.IAnyValue,
  ): boolean {
    const valueNum = target.intValue ?? target.doubleValue ?? undefined;
    if (!valueNum) return false;

    return this.matchNumber(valueNum);
  }

  protected abstract matchNumber(target: number | Long): boolean;

  matchString(_: string | null | undefined): boolean {
    return false;
  }

  protected toJsonObj(): JsonNumComparable {
    return {
      value: this.value,
    };
  }
}
