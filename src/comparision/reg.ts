import { Comparable, Primitive } from "@/comparision/comparable";
import { opentelemetry } from "@/generated/otelpbj";
import { Kind } from "@/comparision/kind";

export class Reg extends Comparable {
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
    return "reg";
  }

  protected toJsonObj(): Record<string, Primitive> {
    return {
      source: this.regExp.source,
      flags: this.regExp.flags,
    };
  }

  static fromJsonObj(obj: any): Reg {
    return new Reg(new RegExp(obj.source, obj.flags));
  }
}
