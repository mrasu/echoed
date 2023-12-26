import { NumComparable } from "@/comparision/numComparable";
import Long from "long";
import { Kind } from "@/comparision/kind";

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
    return "lt";
  }

  static fromJsonObj(obj: any): Lt {
    return new Lt(obj.value);
  }
}
