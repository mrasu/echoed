import { NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";

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
    return "lte";
  }

  static fromJsonObj(obj: any): Lte {
    return new Lte(obj.value);
  }
}
