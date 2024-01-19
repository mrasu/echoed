import { JsonNumComparable, NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";
import { z } from "zod";

const KIND = "gt";

export const JsonGt = JsonNumComparable.extend({
  kind: z.literal(KIND),
});
export type JsonGt = z.infer<typeof JsonGt>;

export class Gt extends NumComparable {
  constructor(value: number) {
    super(value);
  }

  protected matchNumber(target: number | Long): boolean {
    if (typeof target === "number") {
      return this.value < target;
    } else {
      return target.greaterThan(this.value);
    }
  }

  protected get kind(): Kind {
    return KIND;
  }

  static fromJsonObj(obj: JsonNumComparable): Gt {
    return new Gt(obj.value);
  }
}
