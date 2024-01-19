import { opentelemetry } from "@/generated/otelpbj";
import { Kind } from "@/comparision/kind";
import { z } from "zod";

export const Primitive = z.union([z.string(), z.number(), z.boolean()]);
export type Primitive = z.infer<typeof Primitive>;

export abstract class Comparable {
  abstract matchString(target: string | null | undefined): boolean;

  matchIAnyValue(
    target: opentelemetry.proto.common.v1.IAnyValue | undefined | null,
  ): boolean {
    if (!target) return false;

    return this.matchIAnyVal(target);
  }

  protected abstract matchIAnyVal(
    target: opentelemetry.proto.common.v1.IAnyValue,
  ): boolean;

  toJSON(): unknown {
    return {
      kind: this.kind,
      ...this.toJsonObj(),
    };
  }

  protected abstract get kind(): Kind;
  protected abstract toJsonObj(): Record<string, Primitive>;
}
