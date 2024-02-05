import { Kind } from "@/comparision/kind";
import { JsonNumComparable, NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { z } from "zod";

const KIND = "lte";

export const JsonLte = JsonNumComparable.extend({
  kind: z.literal(KIND),
});
export type JsonLte = z.infer<typeof JsonLte>;

export class Lte extends NumComparable {
  constructor(value: number) {
    super(value);
  }

  protected matchNumber(target: number | Long): boolean {
    if (typeof target === "number") {
      return target <= this.value;
    } else {
      return target.lessThanOrEqual(this.value);
    }
  }

  protected get kind(): Kind {
    return KIND;
  }

  static fromJsonObj(obj: JsonNumComparable): Lte {
    return new Lte(obj.value);
  }
}
