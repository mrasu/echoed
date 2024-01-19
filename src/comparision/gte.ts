import { JsonNumComparable, NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";
import { z } from "zod";

const KIND = "gte";

export const JsonGte = JsonNumComparable.extend({
  kind: z.literal(KIND),
});
export type JsonGte = z.infer<typeof JsonGte>;

export class Gte extends NumComparable {
  constructor(value: number) {
    super(value);
  }

  protected matchNumber(target: number | Long): boolean {
    if (typeof target === "number") {
      return this.value <= target;
    } else {
      return target.greaterThanOrEqual(this.value);
    }
  }

  protected get kind(): Kind {
    return KIND;
  }

  static fromJsonObj(obj: JsonNumComparable): Gte {
    return new Gte(obj.value);
  }
}
