import { NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";

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
    return "gte";
  }

  static fromJsonObj(obj: any): Gte {
    return new Gte(obj.value);
  }
}
