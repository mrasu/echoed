import { Comparable } from "@/comparision/comparable";
import { Kind } from "@/comparision/kind";
import { opentelemetry } from "@/generated/otelpbj";
import { z } from "zod";

const KIND = "reg";

export const JsonReg = z.strictObject({
  kind: z.literal(KIND),
  source: z.string(),
  flags: z.string(),
});
export type JsonReg = z.infer<typeof JsonReg>;

export class Reg extends Comparable {
  static fromJsonObj(obj: JsonReg): Reg {
    return new Reg(new RegExp(obj.source, obj.flags));
  }

  static fromString(str: string): Reg {
    return new Reg(new RegExp(str));
  }

  constructor(private regExp: RegExp) {
    super();
  }

  protected matchIAnyVal(
    target: opentelemetry.proto.common.v1.IAnyValue,
  ): boolean {
    if (!target.stringValue) {
      return false;
    }

    return this.matchString(target.stringValue);
  }

  matchString(target: string | null | undefined): boolean {
    if (!target) return false;

    return this.regExp.test(target);
  }

  protected get kind(): Kind {
    return KIND;
  }

  protected toJsonObj(): Omit<JsonReg, "kind"> {
    return {
      source: this.regExp.source,
      flags: this.regExp.flags,
    };
  }
}
