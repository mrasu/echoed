import { JsonNumComparable, NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";
import { z } from "zod";

const KIND = "lt";

export const JsonLt = JsonNumComparable.extend({
  kind: z.literal(KIND),
});
export type JsonLt = z.infer<typeof JsonLt>;

export class Lt extends NumComparable {
  constructor(value: number) {
    super(value);
  }

  protected matchNumber(target: number | Long): boolean {
    if (typeof target === "number") {
      return target < this.value;
    } else {
      return target.lessThan(this.value);
    }
  }

  protected get kind(): Kind {
    return KIND;
  }

  static fromJsonObj(obj: JsonNumComparable): Lt {
    return new Lt(obj.value);
  }
}
