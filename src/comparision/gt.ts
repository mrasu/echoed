import { NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";

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
    return "gt";
  }

  static fromJsonObj(obj: any): Gt {
    return new Gt(obj.value);
  }
}
